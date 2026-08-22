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
import type { SessionRecord } from '../../src/storage/session-record.ts';
import { applyCorrection } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import { generateFor } from '../../src/programming/session-builder.ts';

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

test('progress and the seed survive a restart together', () => {
  const store = createSessionStore(createMemoryStorage());
  const record: SessionRecord = {
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 3,
    completedAt: null,
    summary: null,
  };
  store.write(record);

  const read = store.read();
  assert.deepEqual(read, record, 'resuming mid-session must restore both the seed and the position');
  assert.equal(read?.done, 3, 'a restart must not silently restart the workout');
});

test('a correction after a restart still cannot rewrite the completed session', () => {
  const inventory = inventoryWith(['park-bench', 'pull-up-bar']);
  const store = createSessionStore(createMemoryStorage());
  const summary = { movements: 8, featuresUsed: ['park-bench', 'pull-up-bar'], wasSubstitute: false };
  store.write({
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 8,
    completedAt: LATER,
    summary,
  });

  const corrected = applyCorrection(inventory, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: LATER,
  });
  const venue = createVenueState(createMemoryStorage());
  venue.save(corrected);

  assert.deepEqual(
    store.read()?.summary,
    summary,
    'the workout that was performed must keep naming the features it used — ' +
      'a later correction is a fact about the venue, not about the past session',
  );
  assert.equal(venue.load().kind, 'loaded', 'the corrected inventory must still rehydrate');
});

test('a substitute completion stays labeled a substitute across a restart', () => {
  const store = createSessionStore(createMemoryStorage());
  store.write({
    seed: 'restart-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'adverse',
    done: 7,
    completedAt: LATER,
    summary: { movements: 7, featuresUsed: [], wasSubstitute: true },
  });

  const read = store.read();
  assert.equal(
    read?.summary?.wasSubstitute,
    true,
    'a substitute must never be presented as a park session, including after a reload (§11)',
  );
  assert.deepEqual(
    read?.summary?.featuresUsed,
    [],
    'a substitute claims no confirmed features, so its record must claim none either',
  );
});
