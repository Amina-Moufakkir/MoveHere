/**
 * What never becomes history.
 *
 * §24.6: partial sessions produce no Activity records in v1, and discard
 * creates none. These are structural rather than behavioural — the append is
 * the only writer, and nothing but terminal completion calls it — so these
 * tests assert the structure rather than a remembered check.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import { createSessionStore } from '../../src/storage/session-record.ts';
import { buildActivityRecord } from '../../src/domain/activity-snapshot.ts';
import { generateFromView } from '../../src/programming/session-builder.ts';
import { projectGenerationView } from '../../src/domain/confirmation.ts';
import { candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import { isFinished } from '../../src/domain/session-lifecycle.ts';
import { recordIdFor } from '../../src/storage/activity-record.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';

const AT = '2026-08-26T10:00:00.000Z';
const ids = ['park-bench', 'stairs'];
const inventory = commitConfirmations(
  candidatesFrom(ids as SupportedFeatureId[], AT),
  new Map<SupportedFeatureId, ConfirmationDecision>(
    ids.map((i) => [i as SupportedFeatureId, 'present' as ConfirmationDecision]),
  ),
  AT,
).inventory;

/** `resolved` movements marked Done, the rest still pending. */
const active = (resolved: number): ActiveSessionRecord => ({
  sessionId: 'w-1',
  seed: 's-1',
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
  execution: Array.from({ length: resolved }, () => 'completed' as const),
  frozenView: projectGenerationView(inventory),
});

const workoutFor = (s: ActiveSessionRecord) =>
  generateFromView({ view: s.frozenView, minutes: s.minutes, goal: s.goal, conditions: s.conditions, seed: s.seed });

const totalOf = (s: ActiveSessionRecord) => {
  const w = workoutFor(s);
  return w === null || w.kind === 'not-generated'
    ? 0
    : w.blocks.reduce((n, b) => n + b.items.length, 0);
};

test('a session at done = 0 is not finished and writes nothing', () => {
  const store = createActivityStore(createMemoryStorage());
  const s = active(0);
  assert.equal(isFinished(s, totalOf(s)), false);
  assert.equal(store.list().length, 0, 'nothing appended without terminal completion');
});

test('a partially completed session is not finished and writes nothing', () => {
  const store = createActivityStore(createMemoryStorage());
  const s = active(2);
  const total = totalOf(s);
  assert.ok(total > 2, 'the fixture must actually be partial');
  assert.equal(isFinished(s, total), false);
  assert.equal(store.list().length, 0);
});

test('discarding leaves history empty and the session gone', () => {
  const storage = createMemoryStorage();
  const sessions = createSessionStore(storage);
  const activity = createActivityStore(storage);

  sessions.write(active(3));
  assert.notEqual(sessions.read(), null);

  /* Discard is a clear, and nothing else. It has no path to the activity store. */
  sessions.clear();

  assert.equal(sessions.read(), null, 'the workout is gone');
  assert.equal(activity.list().length, 0, 'and it left no history behind');
  assert.equal(activity.has(recordIdFor('w-1')), false);
});

test('discard destroys the workout and nothing outside it', () => {
  const storage = createMemoryStorage();
  const sessions = createSessionStore(storage);
  storage.setItem('movehere:inventory:home-park', 'inventory-untouched');
  sessions.write(active(3));

  sessions.clear();

  assert.equal(
    storage.getItem('movehere:inventory:home-park'),
    'inventory-untouched',
    'the confirmed park survives a discarded workout (Invariant 8)',
  );
});

test('only terminal completion produces a record', () => {
  const store = createActivityStore(createMemoryStorage());
  const s = active(0);
  const total = totalOf(s);
  const finished = { ...s, execution: Array.from({ length: total }, () => 'completed' as const) };
  assert.equal(isFinished(finished, total), true);

  const workout = workoutFor(finished);
  assert.notEqual(workout, null);
  if (workout === null) return;
  const record = buildActivityRecord(finished, workout, { at: AT, localDate: '2026-08-26' });
  assert.notEqual(record, null);
  if (record === null) return;

  assert.equal(store.append(record), 'appended');
  assert.equal(store.list().length, 1);
  assert.equal(
    store.list()[0]?.movements.length,
    total,
    'the record holds every movement that was programmed',
  );
});
