/**
 * What survives closing the app.
 *
 * session-flow.test.ts covers regeneration from a seed held in memory. This
 * covers the restart itself: after a real restart there is no in-memory
 * inventory, only bytes, and the session has to be rebuilt from what
 * rehydration returns. Those are different objects reached by a different
 * route, and the guarantee is that they generate the same workout.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createVenueState, candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import { createSessionStore } from '../../src/storage/session-record.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';
import { applyCorrection, projectGenerationView } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import { generateFor, generateFromView } from '../../src/programming/session-builder.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { buildActivityRecord } from '../../src/domain/activity-snapshot.ts';

const AT = '2026-08-21T00:00:00.000Z';
const LATER = '2026-08-21T12:00:00.000Z';

const inventoryWith = (ids: readonly SupportedFeatureId[]) =>
  commitConfirmations(
    candidatesFrom(ids, AT),
    new Map(ids.map((i) => [i, 'present' as ConfirmationDecision])),
    AT,
  ).inventory;

const request = { minutes: 30 as const, goal: 'strength' as const, conditions: 'acceptable' as const, seed: 'restart-seed' };

test('a session rebuilt from persisted bytes matches the one before the restart', () => {
  const original = inventoryWith(['park-bench', 'pull-up-bar']);
  const before = generateFor({ ...request, inventory: original });

  // The restart: nothing in memory, only what was written.
  const venue = createVenueState(createMemoryStorage());
  venue.save(original);
  const loaded = venue.load();
  assert.equal(loaded.kind, 'loaded', 'persisted venue state must rehydrate');
  if (loaded.kind !== 'loaded') return;

  assert.deepEqual(
    generateFor({ ...request, inventory: loaded.inventory }),
    before,
    'a reload must return the same workout, not a plausible-looking different one — ' +
      'the rehydrated inventory is a different object reached by a different route',
  );
});

test('progress, seed and frozen view survive a restart together', () => {
  const store = createSessionStore(createMemoryStorage());
  const record: ActiveSessionRecord = {
    sessionId: 'w-restart',
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: ['completed', 'completed', 'completed'],
    frozenView: projectGenerationView(inventoryWith(['park-bench', 'pull-up-bar'])),
  };
  store.write(record);

  const read = store.read();
  assert.equal(read?.execution.length, 3, 'a restart must not silently restart the workout');
  assert.equal(read?.seed, 'restart-seed');
  assert.deepEqual(
    [...(read?.frozenView?.usableFeatures ?? [])],
    ['park-bench', 'pull-up-bar'],
    'and the inputs it was generated from must come back with it, or resume is not faithful',
  );
});

test('a restart resumes the same workout, not an equivalent one', () => {
  const store = createSessionStore(createMemoryStorage());
  const record: ActiveSessionRecord = {
    sessionId: 'w-restart-2',
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: ['completed', 'completed', 'completed'],
    frozenView: projectGenerationView(inventoryWith(['park-bench', 'pull-up-bar'])),
  };
  store.write(record);

  const shape = (r: ActiveSessionRecord | null) => {
    if (r === null) return null;
    const out = generateFromView({
      view: r.frozenView,
      minutes: r.minutes,
      goal: r.goal,
      conditions: r.conditions,
      seed: r.seed,
    });
    return out === null || out.kind === 'not-generated'
      ? null
      : out.blocks.flatMap((b) => b.items.map((i) => String(i.exerciseId)));
  };

  assert.deepEqual(shape(store.read()), shape(record), 'bytes and memory must agree');
});

test('a correction after a restart still cannot rewrite the completed session', () => {
  // Same guarantee as before, now carried by the Activity record rather than by
  // a summary living on the active session — which is what made it rewritable.
  const inventory = inventoryWith(['park-bench', 'pull-up-bar']);
  const active: ActiveSessionRecord = {
    sessionId: 'w-done',
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: [],
    frozenView: projectGenerationView(inventory),
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

  const activity = createActivityStore(createMemoryStorage());
  const record = buildActivityRecord(active, workout, { at: LATER, localDate: '2026-08-26' });
  assert.notEqual(record, null);
  if (record === null) return;
  activity.append(record);
  const before = JSON.parse(JSON.stringify(activity.findById(record.recordId))) as unknown;

  const corrected = applyCorrection(inventory, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: LATER,
  });
  const venue = createVenueState(createMemoryStorage());
  venue.save(corrected);

  assert.deepEqual(
    activity.findById(record.recordId),
    before,
    'the workout that was performed must keep naming the features it used — ' +
      'a later correction is a fact about the venue, not about the past session',
  );
  assert.equal(venue.load().kind, 'loaded', 'the corrected inventory must still rehydrate');
});

test('a substitute completion stays labeled a substitute across a restart', () => {
  const active: ActiveSessionRecord = {
    sessionId: 'w-sub',
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'adverse',
    execution: [],
    frozenView: projectGenerationView(inventoryWith(['park-bench'])),
  };
  const workout = generateFromView({
    view: active.frozenView,
    minutes: active.minutes,
    goal: active.goal,
    conditions: active.conditions,
    seed: active.seed,
  });
  assert.equal(workout?.kind, 'substitute-session');
  if (workout === null) return;

  const storage = createMemoryStorage();
  const activity = createActivityStore(storage);
  const record = buildActivityRecord(active, workout, { at: LATER, localDate: '2026-08-26' });
  assert.notEqual(record, null);
  if (record === null) return;
  activity.append(record);

  /* A real restart: nothing in memory, only the bytes. */
  const reread = createActivityStore(storage).findById(record.recordId);
  assert.equal(
    reread?.kind,
    'substitute-session',
    'a substitute must never be presented as a park session, including after a reload (§11)',
  );
  assert.deepEqual(
    reread?.featuresUsed,
    [],
    'a substitute claims no confirmed features, so its record must claim none either',
  );
});
