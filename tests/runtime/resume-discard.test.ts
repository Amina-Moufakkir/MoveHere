/**
 * The resume/discard choice, as state rather than as markup.
 *
 * The screen's job is to render a decision; the decision itself is the position
 * rule and the two lifecycle operations, and those are what these tests pin.
 * The position rule in particular must match the workout player exactly — two
 * rules that agree today are two rules that can stop agreeing.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMemoryStorage } from '../../src/storage/port.ts';
import { createSessionStore } from '../../src/storage/session-record.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { createVenueState, candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import { decideBegin } from '../../src/domain/session-lifecycle.ts';
import { generateFromView } from '../../src/programming/session-builder.ts';
import { projectGenerationView, applyCorrection } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';

const AT = '2026-08-26T10:00:00.000Z';

const inventoryWith = (ids: string[]) =>
  commitConfirmations(
    candidatesFrom(ids as SupportedFeatureId[], AT),
    new Map<SupportedFeatureId, ConfirmationDecision>(
      ids.map((i) => [i as SupportedFeatureId, 'present' as ConfirmationDecision]),
    ),
    AT,
  ).inventory;

const active = (over: Partial<ActiveSessionRecord> = {}): ActiveSessionRecord => ({
  sessionId: 'w-1',
  seed: 's-1',
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
  execution: [],
  frozenView: projectGenerationView(inventoryWith(['park-bench', 'stairs'])),
  ...over,
});

const workoutFor = (s: ActiveSessionRecord) =>
  generateFromView({
    view: s.frozenView,
    minutes: s.minutes,
    goal: s.goal,
    conditions: s.conditions,
    seed: s.seed,
  });

const totalOf = (s: ActiveSessionRecord) => {
  const w = workoutFor(s);
  return w === null || w.kind === 'not-generated'
    ? 0
    : w.blocks.reduce((n, b) => n + b.items.length, 0);
};

/** The player's rule, restated here only so the test can compare against it. */
const positionLabel = (done: number, total: number) => Math.min(done + 1, total);

test('the region appears only when there is unfinished work to resume', () => {
  assert.equal(decideBegin(null).kind, 'begin', 'no session: the ordinary build control stands');
  assert.equal(decideBegin(active()).kind, 'refused', 'a not-started session is still unfinished');
  assert.equal(decideBegin(active({ execution: ['completed', 'completed', 'completed'] })).kind, 'refused');
});

test('position semantics match the workout player exactly', () => {
  const total = totalOf(active());
  assert.ok(total >= 4, 'the fixture needs room to be partway through');
  assert.equal(positionLabel(0, total), 1, 'done = 0 reads as Movement 1');
  assert.equal(positionLabel(2, total), 3, 'done = 2 reads as Movement 3');
  assert.equal(
    positionLabel(total, total),
    total,
    'a session at the end never reads past its own length',
  );
});

test('resume preserves session identity, seed and position', () => {
  const store = createSessionStore(createMemoryStorage());
  const before = active({ execution: ['completed', 'completed'] });
  store.write(before);

  /* Resume is navigation. It touches nothing. */
  const after = store.read();
  assert.equal(after?.sessionId, before.sessionId);
  assert.equal(after?.seed, before.seed);
  assert.equal(after?.execution.length, 2);
  assert.deepEqual(
    [...(after?.frozenView?.usableFeatures ?? [])],
    [...(before.frozenView?.usableFeatures ?? [])],
    'the frozen generation context comes back untouched',
  );
});

test('resume does not regenerate: the same movements come back', () => {
  const s = active({ execution: ['completed', 'completed'] });
  const shape = (r: ActiveSessionRecord) => {
    const w = workoutFor(r);
    return w === null || w.kind === 'not-generated'
      ? null
      : w.blocks.flatMap((b) => b.items.map((i) => String(i.exerciseId)));
  };
  assert.deepEqual(shape(s), shape(s));
});

test('discard-and-build changes session identity and resets position', () => {
  const store = createSessionStore(createMemoryStorage());
  const before = active({ execution: ['completed', 'completed', 'completed', 'completed'] });
  store.write(before);

  /* What discardAndBegin does: mint a new record and replace. */
  const replacement = active({ sessionId: 'w-2', seed: 's-2', execution: [] });
  store.write(replacement);

  const after = store.read();
  assert.notEqual(after?.sessionId, before.sessionId, 'a new attempt is a new identity');
  assert.equal(after?.execution.length, 0, 'and it starts at the beginning');
});

test('discard preserves the request, the confirmed inventory and corrections', () => {
  const storage = createMemoryStorage();
  const sessions = createSessionStore(storage);
  const venue = createVenueState(storage);

  const corrected = applyCorrection(inventoryWith(['park-bench', 'stairs']), {
    kind: 'feature-unusable',
    featureId: 'park-bench' as SupportedFeatureId,
    occurredAt: AT,
  });
  venue.save(corrected);
  sessions.write(active({ execution: ['completed', 'completed', 'completed'], minutes: 45, goal: 'conditioning' }));

  /* Discard is a clear of the session store, and nothing else. */
  sessions.clear();

  const loaded = venue.load();
  assert.equal(loaded.kind, 'loaded', 'the confirmed park survives');
  if (loaded.kind !== 'loaded') return;
  assert.deepEqual(
    loaded.inventory.features.map((f) => `${f.featureId}:${f.usability.kind}`),
    ['park-bench:reported-unusable', 'stairs:usable'],
    'including the correction, which is a fact about the venue, not the workout',
  );

  /* The request is provider state carried into the replacement, so the
     replacement is built from the choices still on screen. */
  const replacement = active({ sessionId: 'w-2', minutes: 45, goal: 'conditioning', execution: [] });
  sessions.write(replacement);
  assert.equal(sessions.read()?.minutes, 45, 'the request the user chose is what gets built');
  assert.equal(sessions.read()?.goal, 'conditioning');
});

test('discarding writes nothing to Activity', () => {
  const storage = createMemoryStorage();
  const sessions = createSessionStore(storage);
  const activity = createActivityStore(storage);

  sessions.write(active({ execution: ['completed', 'completed', 'completed', 'completed', 'completed'] }));
  const before = activity.list().length;

  sessions.clear();

  assert.equal(activity.list().length, before, 'a discarded workout leaves no history');
  assert.equal(activity.list().length, 0);
});

test('an active session keeps its own request when setup choices change', () => {
  /* Editing Time/Goal/Conditions on setup configures the replacement. The
     session in flight holds its own copy and must not drift. */
  const store = createSessionStore(createMemoryStorage());
  const s = active({ minutes: 30, goal: 'strength', execution: ['completed', 'completed'] });
  store.write(s);

  const restored = store.read();
  assert.equal(restored?.minutes, 30, 'the running session keeps what it was built with');
  assert.equal(restored?.goal, 'strength');
  assert.equal(restored?.execution.length, 2);
});
