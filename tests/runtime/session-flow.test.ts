/**
 * M7 — setup, generation, progress and correction as the UI drives them.
 *
 * These exercise the same functions the client components call, so what is
 * verified here is the wiring rather than a parallel implementation of it.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildInput, generateFor, MATRIX, PROGRAMMING, generateFromView } from '../../src/programming/session-builder.ts';
import { assessmentFor } from '../../src/programming/conditions.ts';
import { readSession, writeSession, clearSession } from '../../lib/session-store.ts';
import type { ActiveSessionRecord } from '../../lib/session-store.ts';
import {
  candidatesFrom,
  commitConfirmations,
} from '../../lib/venue-store.ts';
import { applyCorrection, projectGenerationView } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision, ConfirmedVenueInventory } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { SessionGenerationOutput } from '../../src/domain/session.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import { buildActivityRecord } from '../../src/domain/activity-snapshot.ts';

const NOW = '2026-08-21T12:00:00Z';

const inventoryWith = (ids: readonly SupportedFeatureId[]): ConfirmedVenueInventory =>
  commitConfirmations(
    candidatesFrom(ids, NOW),
    new Map(ids.map((id) => [id, 'present' as ConfirmationDecision])),
    NOW,
  ).inventory;

const items = (out: SessionGenerationOutput | null) =>
  out !== null && out.kind !== 'not-generated' ? out.blocks.flatMap((b) => [...b.items]) : [];

test('content loads and feasibility passes at startup', () => {
  assert.ok(MATRIX !== null, 'matrix loaded');
  assert.ok(PROGRAMMING !== null, 'feasibility passed');
});

test('a confirmed park with acceptable conditions produces a park session', () => {
  const out = generateFor({
    inventory: inventoryWith(['park-bench', 'pull-up-bar']),
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    seed: 'seed-a',
  });
  assert.equal(out?.kind, 'park-session');
  if (out?.kind !== 'park-session') return;
  assert.ok(out.featuresUsed.length > 0);
});

test('the same seed regenerates the same session — a reload cannot change it', () => {
  const args = {
    inventory: inventoryWith(['park-bench', 'stairs']),
    minutes: 30 as const,
    goal: 'strength' as const,
    conditions: 'acceptable' as const,
    seed: 'stable-seed',
  };
  assert.deepEqual(generateFor(args), generateFor(args));
});

test('a new seed can produce a different, still valid session', () => {
  const base = {
    inventory: inventoryWith(['park-bench', 'pull-up-bar', 'stairs', 'hill']),
    minutes: 45 as const,
    goal: 'conditioning' as const,
    conditions: 'acceptable' as const,
  };
  const shapes = new Set<string>();
  for (let i = 0; i < 25; i++) {
    const out = generateFor({ ...base, seed: `seed-${i}` });
    assert.equal(out?.kind, 'park-session');
    shapes.add(JSON.stringify(items(out).map((it) => it.exerciseId)));
  }
  assert.ok(shapes.size > 1, 'seeds vary the session');
});

test('adverse and unknown conditions both produce substitute sessions', () => {
  for (const conditions of ['adverse', 'unknown'] as const) {
    const out = generateFor({
      inventory: inventoryWith(['park-bench', 'pull-up-bar']),
      minutes: 30,
      goal: 'strength',
      conditions,
      seed: 's',
    });
    assert.equal(out?.kind, 'substitute-session', conditions);
    if (out?.kind !== 'substitute-session') continue;
    assert.equal(
      out.reason.kind,
      conditions === 'adverse' ? 'conditions-adverse' : 'conditions-unavailable',
    );
    assert.ok(
      items(out).every((it) => it.basis.kind === 'environment-independent'),
      'a substitute uses no venue movement',
    );
  }
});

test('a user report of adverse conditions carries no invented cause', () => {
  const assessment = assessmentFor('adverse');
  assert.equal(assessment.kind, 'adverse');
  if (assessment.kind !== 'adverse') return;
  assert.deepEqual(assessment.cause, { kind: 'user-reported' });
});

test('pull never appears without a bar', () => {
  const pull = new Set(
    (MATRIX?.exercises ?? []).filter((e) => e.pattern === 'pull').map((e) => e.id as string),
  );
  for (const ids of [[], ['park-bench'], ['stairs', 'hill'], ['parallel-bars']] as const) {
    for (let i = 0; i < 6; i++) {
      const out = generateFor({
        inventory: ids.length === 0 ? null : inventoryWith(ids),
        minutes: 45,
        goal: 'strength',
        conditions: 'acceptable',
        seed: `p-${i}`,
      });
      for (const item of items(out)) {
        assert.ok(!pull.has(item.exerciseId as string), `pull without a bar: ${item.exerciseId}`);
      }
    }
  }
});

test('every source badge matches a real SelectionBasis the venue supports', () => {
  const ids: readonly SupportedFeatureId[] = ['park-bench', 'pull-up-bar'];
  const out = generateFor({
    inventory: inventoryWith(ids),
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    seed: 'badge',
  });
  for (const item of items(out)) {
    if (item.basis.kind !== 'confirmed-feature') continue;
    assert.ok(ids.includes(item.basis.featureId), 'badge names a confirmed feature');
    const claim = MATRIX?.compatibilities.find((c) => c.id === item.basis.compatibilityId);
    assert.ok(claim !== undefined && claim.exerciseId === item.exerciseId);
  }
});

test('marking a feature unusable changes the next session without deleting it', () => {
  const before = inventoryWith(['park-bench', 'pull-up-bar']);
  const args = { minutes: 30 as const, goal: 'strength' as const, conditions: 'acceptable' as const, seed: 'fixed' };

  const withBar = generateFor({ ...args, inventory: before });
  assert.ok(items(withBar).some((it) => it.basis.kind === 'confirmed-feature' && it.basis.featureId === 'pull-up-bar'));

  const after = applyCorrection(before, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: NOW,
  });

  // Still venue knowledge...
  assert.ok(after.features.some((f) => f.featureId === 'pull-up-bar'));
  // ...but no longer generation-eligible.
  const withoutBar = generateFor({ ...args, inventory: after });
  assert.ok(
    !items(withoutBar).some(
      (it) => it.basis.kind === 'confirmed-feature' && it.basis.featureId === 'pull-up-bar',
    ),
    'an unusable feature cannot appear in a session',
  );
});

test('active-session state round-trips, and cleared state is no session', () => {
  clearSession();
  assert.equal(readSession(), null);

  const record: ActiveSessionRecord = {
    sessionId: 'w-abc',
    seed: 'abc',
    minutes: 20,
    goal: 'conditioning',
    conditions: 'acceptable',
    execution: ['completed', 'completed'],
    frozenView: null,
  };
  writeSession(record);
  assert.deepEqual(readSession(), record);

  // Progress survives. Completion does not live here any more (§24.3): the
  // active-session store represents unfinished work only, so there is no
  // completedAt to round-trip and no summary to disagree with history.
  writeSession({ ...record, execution: ['completed', 'completed', 'completed', 'completed', 'completed'] });
  assert.equal(readSession()?.execution.length, 5);

  clearSession();
  assert.equal(readSession(), null, 'cleared state is no session, not stale session');
});

test('a completed session is a record, not a live derivation', () => {
  // Unchanged in intent, moved in mechanism. The completed session used to be a
  // flag on the active record and was therefore reachable, re-finishable and
  // rewritable. It is now an immutable Activity record, and the active store
  // cannot represent it at all.
  clearSession();

  const active: ActiveSessionRecord = {
    sessionId: 'w-done',
    seed: 'done-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: [],
    frozenView: projectGenerationView(inventoryWith(['stairs'])),
  };

  const workout = generateFromView({
    view: active.frozenView,
    minutes: active.minutes,
    goal: active.goal,
    conditions: active.conditions,
    seed: active.seed,
  });
  assert.notEqual(workout, null);
  if (workout === null) return;

  const store = createActivityStore(createMemoryStorage());
  const completed = buildActivityRecord(active, workout, { at: NOW, localDate: '2026-08-26' });
  assert.notEqual(completed, null);
  if (completed === null) return;
  store.append(completed);
  const before = JSON.parse(JSON.stringify(store.findById(completed.recordId))) as unknown;

  // The venue changes underneath it.
  const corrected = applyCorrection(inventoryWith(['stairs']), {
    kind: 'feature-unusable',
    featureId: 'stairs',
    occurredAt: NOW,
  });
  const next = generateFor({
    inventory: corrected,
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    seed: 'done-seed',
  });

  // The next session reflects the correction...
  assert.equal(next?.kind, 'substitute-session');
  // ...while the completed record still says exactly what it was.
  assert.deepEqual(store.findById(completed.recordId), before);
  clearSession();
});

test('generation input is assembled from confirmed state only', () => {
  const input = buildInput({
    inventory: inventoryWith(['park-bench']),
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    seed: 'x',
  });
  assert.ok(input !== null);
  assert.equal(input.context.kind, 'venue-aware');
  if (input.context.kind !== 'venue-aware') return;
  assert.deepEqual([...input.context.venue.usableFeatures], ['park-bench']);
  assert.equal(input.policy.goal, 'strength');
});

test('an inventory whose features are all unusable generates venue-blind', () => {
  const inventory = applyCorrection(inventoryWith(['park-bench']), {
    kind: 'feature-unusable',
    featureId: 'park-bench',
    occurredAt: NOW,
  });
  const input = buildInput({ inventory, minutes: 30, goal: 'strength', conditions: 'acceptable', seed: 'y' });
  assert.equal(input?.context.kind, 'environment-independent');
});
