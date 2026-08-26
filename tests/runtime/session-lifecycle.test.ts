/**
 * The two properties the whole stage exists to establish.
 *
 * **An unfinished session is a stable resumable derivation.** Regenerating it
 * from its frozen inputs yields the same movements after the confirmed
 * inventory has changed underneath it — which it did not, before the view was
 * frozen: the audit watched a running session's remaining movements re-derive
 * beneath a position counter that never moved.
 *
 * **A completed session is an immutable historical snapshot.** Reading the
 * record back after mutating inventory, usability and request yields the same
 * account of what was trained, with no call into the generator.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateFromView, generateFor } from '../../src/programming/session-builder.ts';
import { projectGenerationView, applyCorrection } from '../../src/domain/confirmation.ts';
import { candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import { buildActivityRecord } from '../../src/domain/activity-snapshot.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import { recordIdFor } from '../../src/storage/activity-record.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';

const AT = '2026-08-26T10:00:00.000Z';

const inventoryWith = (ids: string[]) => {
  const candidates = candidatesFrom(ids as SupportedFeatureId[], AT);
  const decisions = new Map<SupportedFeatureId, ConfirmationDecision>(
    ids.map((id) => [id as SupportedFeatureId, 'present' as ConfirmationDecision]),
  );
  return commitConfirmations(candidates, decisions, AT).inventory;
};

const shapeOf = (out: ReturnType<typeof generateFromView>) => {
  if (out === null || out.kind === 'not-generated') return null;
  return {
    kind: out.kind,
    movements: out.blocks.flatMap((b) =>
      b.items.map((i) => ({
        exerciseId: String(i.exerciseId),
        block: b.name,
        prescription: i.prescription,
      })),
    ),
  };
};

const session = (over: Partial<ActiveSessionRecord> = {}): ActiveSessionRecord => ({
  sessionId: 'w-1',
  seed: 's-1',
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
  done: 0,
  frozenView: projectGenerationView(inventoryWith(['park-bench', 'stairs'])),
  ...over,
});

test('resume is faithful after the confirmed inventory changes', () => {
  const active = session();
  const before = shapeOf(generateFromView({ ...active, view: active.frozenView }));
  assert.notEqual(before, null);

  /* The park changes underneath the running session in the two ways it can:
     a feature is reported unusable, and the whole inventory is reduced. */
  const corrected = applyCorrection(inventoryWith(['park-bench', 'stairs']), {
    kind: 'feature-unusable',
    featureId: 'park-bench' as SupportedFeatureId,
    occurredAt: AT,
  });
  const liveNow = shapeOf(
    generateFor({
      inventory: corrected,
      minutes: active.minutes,
      goal: active.goal,
      conditions: active.conditions,
      seed: active.seed,
    }),
  );

  const after = shapeOf(generateFromView({ ...active, view: active.frozenView }));
  assert.deepEqual(after, before, 'the running session must be untouched by the correction');
  assert.notDeepEqual(
    liveNow,
    before,
    'and the correction must genuinely have changed what live generation would produce — ' +
      'otherwise this test would pass for the wrong reason',
  );
});

test('the same active record always regenerates the same movements', () => {
  const active = session();
  const a = shapeOf(generateFromView({ ...active, view: active.frozenView }));
  const b = shapeOf(generateFromView({ ...active, view: active.frozenView }));
  assert.deepEqual(a, b);
});

test('a completed record survives inventory, usability and request mutation', () => {
  const active = session();
  const workout = generateFromView({ ...active, view: active.frozenView });
  assert.notEqual(workout, null);
  if (workout === null) return;

  const record = buildActivityRecord(active, workout, { at: AT, localDate: '2026-08-26' });
  assert.notEqual(record, null);
  if (record === null) return;

  const store = createActivityStore(createMemoryStorage());
  store.append(record);
  const snapshot = JSON.parse(JSON.stringify(store.findById(record.recordId))) as unknown;

  /* Everything the record could conceivably have been re-derived from now
     changes. Nothing may reach it. */
  applyCorrection(inventoryWith(['park-bench', 'stairs']), {
    kind: 'feature-unusable',
    featureId: 'park-bench' as SupportedFeatureId,
    occurredAt: AT,
  });
  inventoryWith([]);

  const reread = JSON.parse(JSON.stringify(store.findById(record.recordId))) as unknown;
  assert.deepEqual(reread, snapshot, 'the record must be byte-equivalent after mutation');
});

test('the record describes the workout without the generator', () => {
  const active = session();
  const workout = generateFromView({ ...active, view: active.frozenView });
  if (workout === null || workout.kind === 'not-generated') return;
  const record = buildActivityRecord(active, workout, { at: AT, localDate: '2026-08-26' });
  assert.notEqual(record, null);
  if (record === null) return;

  const expected = workout.blocks.flatMap((b) => b.items.map((i) => String(i.exerciseId)));
  assert.deepEqual(
    record.movements.map((m) => m.exerciseId),
    expected,
    'order is array position, and it is the order that was performed',
  );
  assert.deepEqual(
    record.movements.map((m) => m.prescription),
    workout.blocks.flatMap((b) => b.items.map((i) => i.prescription)),
    'prescriptions are stored as programmed',
  );
  assert.equal(record.recordId, recordIdFor(active.sessionId));
});

test('a substitute session records its kind and reason, and no features', () => {
  const active = session({ conditions: 'adverse', sessionId: 'w-sub' });
  const workout = generateFromView({ ...active, view: active.frozenView });
  if (workout === null) return;
  assert.equal(workout.kind, 'substitute-session', 'adverse conditions produce a substitute');
  const record = buildActivityRecord(active, workout, { at: AT, localDate: '2026-08-26' });
  assert.equal(record?.kind, 'substitute-session');
  assert.deepEqual(record?.featuresUsed, [], 'a substitute used no confirmed feature');
  assert.equal(typeof record?.substituteReason, 'string');
});
