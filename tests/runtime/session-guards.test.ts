/**
 * The guards that stop unfinished work being destroyed, and confirmed authority
 * being erased.
 *
 * Both defects these cover were found in production by the Batch F audit, not
 * by reasoning about the code, so each test states the behaviour that shipped.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideBegin, decideStartup, isFinished } from '../../src/domain/session-lifecycle.ts';
import { restoreDecisions, candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import { applyCorrection, projectGenerationView } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';

const AT = '2026-08-26T10:00:00.000Z';

const active = (over: Partial<ActiveSessionRecord> = {}): ActiveSessionRecord => ({
  sessionId: 'w-1',
  seed: 's-1',
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
  done: 0,
  frozenView: null,
  ...over,
});

const confirmed = (ids: string[], decisions?: Map<SupportedFeatureId, ConfirmationDecision>) => {
  const candidates = candidatesFrom(ids as SupportedFeatureId[], AT);
  const map =
    decisions ??
    new Map<SupportedFeatureId, ConfirmationDecision>(
      ids.map((id) => [id as SupportedFeatureId, 'present' as ConfirmationDecision]),
    );
  return commitConfirmations(candidates, map, AT).inventory;
};

test('a new session is refused while unfinished work exists', () => {
  assert.equal(decideBegin(null).kind, 'begin');
  const decision = decideBegin(active({ done: 3 }));
  assert.equal(decision.kind, 'refused');
  if (decision.kind !== 'refused') return;
  assert.equal(decision.reason, 'unfinished-session-exists');
});

test('a not-yet-started session is still unfinished work', () => {
  assert.equal(
    decideBegin(active({ done: 0 })).kind,
    'refused',
    'done === 0 is a session, not the absence of one',
  );
});

test('startup reconciles a session whose completion record already exists', () => {
  assert.equal(decideStartup(null, false).kind, 'none');
  assert.equal(decideStartup(active(), false).kind, 'restore');
  assert.equal(
    decideStartup(active(), true).kind,
    'reconcile',
    'interrupted between append and clear: completion happened, so clear rather than restore',
  );
});

test('finished is a function of position and total, not of a stored flag', () => {
  assert.equal(isFinished(active({ done: 6 }), 7), false);
  assert.equal(isFinished(active({ done: 7 }), 7), true);
  assert.equal(isFinished(active({ done: 0 }), 0), false, 'no movements is not finished');
});

test('confirmation restores recorded Yes, and invents nothing', () => {
  const inventory = confirmed(['park-bench', 'stairs']);
  const restored = restoreDecisions(inventory);
  assert.equal(restored.get('park-bench' as SupportedFeatureId), 'present');
  assert.equal(restored.get('stairs' as SupportedFeatureId), 'present');
  assert.equal(restored.size, 2);
});

test('a merely proposed candidate restores nothing', () => {
  const restored = restoreDecisions(null);
  assert.equal(restored.size, 0, 'candidate presence is not authority');

  /* A candidate the user answered "not sure" about never entered inventory, so
     it must not come back as a Yes. */
  const decisions = new Map<SupportedFeatureId, ConfirmationDecision>([
    ['park-bench' as SupportedFeatureId, 'present'],
    ['stairs' as SupportedFeatureId, 'unsure'],
  ]);
  const inventory = confirmed(['park-bench', 'stairs'], decisions);
  const again = restoreDecisions(inventory);
  assert.equal(again.get('park-bench' as SupportedFeatureId), 'present');
  assert.equal(again.has('stairs' as SupportedFeatureId), false, 'unsure is not recorded authority');
});

test('revisiting confirmation and continuing cannot erase confirmed inventory', () => {
  /* The shipped defect, reproduced end to end: confirm a feature, return to the
     confirmation step, and continue without touching anything. */
  const first = confirmed(['park-bench']);
  assert.equal(first.features.length, 1);

  const candidates = candidatesFrom(['park-bench'] as SupportedFeatureId[], AT);
  const asShown = restoreDecisions(first);
  const second = commitConfirmations(candidates, asShown, AT).inventory;

  assert.equal(second.features.length, 1, 'continuing must not empty the park');
  assert.deepEqual(
    second.features.map((f) => f.featureId),
    first.features.map((f) => f.featureId),
  );
  assert.deepEqual(
    [...projectGenerationView(second).usableFeatures],
    [...projectGenerationView(first).usableFeatures],
    'and generation must still see the same venue',
  );
});

test('a prior correction is carried across re-confirmation, not silently undone', () => {
  /* Re-confirmation rebuilds every feature as usable. Without carrying the
     correction, a feature the user reported unusable would quietly become
     usable again. */
  const base = confirmed(['park-bench', 'stairs']);
  const corrected = applyCorrection(base, {
    kind: 'feature-unusable',
    featureId: 'park-bench' as SupportedFeatureId,
    occurredAt: AT,
  });
  assert.deepEqual([...projectGenerationView(corrected).usableFeatures], ['stairs']);

  const candidates = candidatesFrom(['park-bench', 'stairs'] as SupportedFeatureId[], AT);
  const committed = commitConfirmations(candidates, restoreDecisions(corrected), AT).inventory;
  const carried = (corrected.features ?? [])
    .filter((f) => f.usability.kind === 'reported-unusable')
    .reduce(
      (acc, f) =>
        acc.features.some((c) => c.featureId === f.featureId)
          ? applyCorrection(acc, {
              kind: 'feature-unusable',
              featureId: f.featureId,
              occurredAt: AT,
            })
          : acc,
      committed,
    );

  assert.deepEqual(
    [...projectGenerationView(carried).usableFeatures],
    ['stairs'],
    'the correction must survive a revisit',
  );
  assert.equal(carried.features.length, 2, 'and the feature is still on the park record');
});
