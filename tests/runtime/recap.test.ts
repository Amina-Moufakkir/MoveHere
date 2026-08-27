/**
 * The recap reads history; it does not rebuild it.
 *
 * Every test here works from a stored record. If any of them needed the
 * generator or current inventory to produce its expected value, the recap would
 * be a derivation again and §24.3 would be broken.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { selectRecap } from '../../src/domain/recap-selection.ts';
import {
  resolveMovementName,
  featureContextText,
  RETIRED_MOVEMENT_NOTE,
  HISTORY_VS_CORRECTION,
  groupByBlock,
} from '../../src/presentation/recap-copy.ts';
import {
  weekStart,
  isInWeekOf,
  lastSevenDays,
  sessionsInWeekOf,
  datesWithActivity,
  workoutsThisWeekText,
  addDays,
} from '../../src/domain/activity-window.ts';
import { buildActivityRecord } from '../../src/domain/activity-snapshot.ts';
import { generateFromView } from '../../src/programming/session-builder.ts';
import { projectGenerationView, applyCorrection } from '../../src/domain/confirmation.ts';
import { candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { ACTIVITY_SCHEMA_VERSION } from '../../src/storage/activity-record.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import type { ActivityRecord, RecordedMovement } from '../../src/storage/activity-record.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';

const AT = '2026-08-26T10:00:00.000Z';

const rec = (over: Partial<ActivityRecord> = {}): ActivityRecord => ({
  recordId: 'r-1',
  recordedAt: AT,
  localDate: '2026-08-26',
  kind: 'park-session',
  goal: 'strength',
  requestedMinutes: 30,
  conditions: 'acceptable',
  featuresUsed: ['park-bench'],
  movements: [
    {
      exerciseId: 'step-up',
      prescription: { kind: 'reps', sets: 4, reps: 10, counting: 'total' },
      blockName: 'Strength',
      featureId: 'park-bench',
      result: 'completed',
    },
  ],
  authorityTier: 'project-content',
  ...over,
});

/* ---------- record selection ---------- */

test('no requested id shows the newest record', () => {
  const s = selectRecap([rec({ recordId: 'r-new' }), rec({ recordId: 'r-old' })], null);
  assert.equal(s.kind, 'record');
  if (s.kind !== 'record') return;
  assert.equal(s.record.recordId, 'r-new');
});

test('an explicit id shows exactly that record', () => {
  const s = selectRecap([rec({ recordId: 'r-new' }), rec({ recordId: 'r-old' })], 'r-old');
  assert.equal(s.kind, 'record');
  if (s.kind !== 'record') return;
  assert.equal(s.record.recordId, 'r-old');
});

test('a missing requested id never silently resolves to the newest', () => {
  const s = selectRecap([rec({ recordId: 'r-new' })], 'r-gone');
  assert.equal(
    s.kind,
    'requested-unavailable',
    'answering a question about one workout with a different workout would put ' +
      'true facts on screen under a false identity',
  );
  if (s.kind !== 'requested-unavailable') return;
  assert.equal(s.recordId, 'r-gone');
});

test('a quarantined record is unavailable, not substituted', () => {
  /* The store drops unreadable rows, so the recap simply never sees them —
     which must surface as "unavailable", not as the next record along. */
  const storage = createMemoryStorage();
  storage.setItem(
    'movehere:activity',
    JSON.stringify({
      schemaVersion: ACTIVITY_SCHEMA_VERSION,
      records: [
        {
          schemaVersion: ACTIVITY_SCHEMA_VERSION,
          ...rec({ recordId: 'r-corrupt' }),
          movements: 'not an array',
        },
        { schemaVersion: ACTIVITY_SCHEMA_VERSION, ...rec({ recordId: 'r-good' }) },
      ],
    }),
  );
  const store = createActivityStore(storage);
  assert.equal(store.read().quarantined, 1);
  const s = selectRecap(store.list(), 'r-corrupt');
  assert.equal(s.kind, 'requested-unavailable');
});

test('no records at all is its own state', () => {
  assert.equal(selectRecap([], null).kind, 'no-records');
});

/* ---------- the record, not the generator ---------- */

const inventoryWith = (ids: string[]) =>
  commitConfirmations(
    candidatesFrom(ids as SupportedFeatureId[], AT),
    new Map<SupportedFeatureId, ConfirmationDecision>(
      ids.map((i) => [i as SupportedFeatureId, 'present' as ConfirmationDecision]),
    ),
    AT,
  ).inventory;

const completed = (): ActivityRecord => {
  const session: ActiveSessionRecord = {
    sessionId: 'w-1',
    seed: 's-1',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: [],
    frozenView: projectGenerationView(inventoryWith(['park-bench', 'stairs'])),
  };
  const workout = generateFromView({ ...session, view: session.frozenView });
  if (workout === null) throw new Error('fixture failed to generate');
  const r = buildActivityRecord(session, workout, { at: AT, localDate: '2026-08-26' });
  if (r === null) throw new Error('fixture produced no record');
  return r;
};

test('movement order and prescriptions come from the record, unchanged', () => {
  const record = completed();
  const store = createActivityStore(createMemoryStorage());
  store.append(record);

  const before = JSON.stringify(store.findById(record.recordId));

  /* Everything the recap could conceivably re-derive from now changes. */
  applyCorrection(inventoryWith(['park-bench', 'stairs']), {
    kind: 'feature-unusable',
    featureId: 'park-bench' as SupportedFeatureId,
    occurredAt: AT,
  });
  inventoryWith([]);

  const after = store.findById(record.recordId);
  assert.equal(JSON.stringify(after), before, 'inventory mutation must not reach the recap');
  assert.deepEqual(
    after?.movements.map((m) => m.exerciseId),
    record.movements.map((m) => m.exerciseId),
    'order is array position and does not re-sort',
  );
  assert.deepEqual(
    after?.movements.map((m) => JSON.stringify(m.prescription)),
    record.movements.map((m) => JSON.stringify(m.prescription)),
    'prescriptions are what was programmed, not what policy would say today',
  );
});

/* ---------- grouping and naming ---------- */

const mv = (exerciseId: string, blockName: string): RecordedMovement => ({
  exerciseId,
  prescription: { kind: 'reps', sets: 3, reps: 8, counting: 'total' },
  blockName,
  featureId: null,
});

test('blocks group by contiguous run, never by merging separated runs', () => {
  const groups = groupByBlock([
    mv('a', 'Strength'),
    mv('b', 'Strength'),
    mv('c', 'Finish'),
    mv('d', 'Strength'),
  ]);
  assert.deepEqual(
    groups.map((g) => [g.blockName, g.movements.length]),
    [
      ['Strength', 2],
      ['Finish', 1],
      ['Strength', 1],
    ],
    'merging the two Strength runs would reorder a workout to tidy a heading',
  );
});

test('an unresolvable exercise id degrades truthfully instead of vanishing', () => {
  const known = resolveMovementName('step-up', () => 'Step-up');
  assert.deepEqual(known, { kind: 'known', name: 'Step-up' });

  const retired = resolveMovementName('long-gone', () => null);
  assert.equal(retired.kind, 'retired');
  if (retired.kind !== 'retired') return;
  assert.equal(retired.exerciseId, 'long-gone', 'the recorded identity is what survives');
  assert.ok(RETIRED_MOVEMENT_NOTE.length > 0, 'and it is labelled rather than left bare');
});

test('feature context appears only when a feature was recorded', () => {
  assert.equal(featureContextText(null), null, 'environment-independent is a fact, not a gap');
  assert.match(featureContextText('park-bench' as SupportedFeatureId) ?? '', /Using the/);
});

test('the history-versus-correction line names both tenses', () => {
  assert.match(HISTORY_VS_CORRECTION, /records what the workout used/i);
  assert.match(HISTORY_VS_CORRECTION, /next/i);
});

/* ---------- calendar semantics ---------- */

test('the week starts on Monday, whatever day it is asked about', () => {
  assert.equal(weekStart('2026-08-27'), '2026-08-24', 'Thursday → that Monday');
  assert.equal(weekStart('2026-08-24'), '2026-08-24', 'Monday → itself');
  assert.equal(weekStart('2026-08-30'), '2026-08-24', 'Sunday belongs to the week that began Monday');
  assert.equal(weekStart('2026-08-31'), '2026-08-31', 'the next Monday starts the next week');
});

test('sessions this week counts records, and multiples on one day each count', () => {
  const today = '2026-08-27';
  assert.equal(sessionsInWeekOf([], today), 0);
  assert.equal(sessionsInWeekOf(['2026-08-27'], today), 1);
  assert.equal(
    sessionsInWeekOf(['2026-08-27', '2026-08-27', '2026-08-27'], today),
    3,
    'three sessions in a day is three sessions, not one active day',
  );
});

test('the week boundary excludes the session before it', () => {
  const today = '2026-08-27';
  assert.equal(isInWeekOf('2026-08-24', today), true, 'Monday is in');
  assert.equal(isInWeekOf('2026-08-30', today), true, 'Sunday is in');
  assert.equal(isInWeekOf('2026-08-23', today), false, 'the previous Sunday is out');
  assert.equal(isInWeekOf('2026-08-31', today), false, 'the next Monday is out');
  assert.equal(
    sessionsInWeekOf(['2026-08-23', '2026-08-24', '2026-08-30', '2026-08-31'], today),
    2,
    'only the two inside the Monday-to-Sunday window',
  );
});

test('the strip is seven days ending today, oldest first', () => {
  const days = lastSevenDays('2026-08-27');
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-08-21');
  assert.equal(days[6], '2026-08-27');
  assert.equal(addDays('2026-08-31', -1), '2026-08-30', 'day steps cross month ends');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31', 'and year ends');
});

test('a marked date means at least one session, and carries no count', () => {
  const marks = datesWithActivity(['2026-08-26', '2026-08-26', '2026-08-24']);
  assert.equal(marks.size, 2, 'two sessions on one date still produce one marked date');
  assert.equal(marks.has('2026-08-26'), true);
  assert.equal(marks.has('2026-08-25'), false);
});

test('the weekly count says workouts, not completed sessions', () => {
  /* Once a workout ended early can hold a record, "completed" is false for part
     of what the number counts (§25.18). */
  assert.equal(workoutsThisWeekText(0), '0 workouts this week');
  assert.equal(workoutsThisWeekText(1), '1 workout this week');
  assert.equal(workoutsThisWeekText(3), '3 workouts this week');
  for (const n of [0, 1, 3]) {
    assert.doesNotMatch(workoutsThisWeekText(n), /completed session/);
  }
});

/* ---------- park vs substitute ---------- */

test('a park record carries its features; a substitute carries its reason and none', () => {
  const park = rec();
  assert.equal(park.kind, 'park-session');
  assert.deepEqual(park.featuresUsed, ['park-bench']);
  assert.equal(park.substituteReason, undefined);

  const sub = rec({
    recordId: 'r-sub',
    kind: 'substitute-session',
    featuresUsed: [],
    substituteReason: 'conditions-adverse',
    movements: [mv('bodyweight-squat', 'Strength')],
  });
  assert.equal(sub.kind, 'substitute-session');
  assert.deepEqual(sub.featuresUsed, [], 'a substitute claims no confirmed features (§11)');
  assert.equal(sub.substituteReason, 'conditions-adverse');
});
