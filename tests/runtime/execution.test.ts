/**
 * The execution model, and the two migrations that depend on proofs.
 *
 * The property under test throughout is Invariant 11: **reaching the end of a
 * workout is not evidence that everything in it was performed.** Most of these
 * would have passed trivially under the scalar model — which is the point.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMPTY_EXECUTION,
  completedCount,
  currentIndex,
  hasExecutionEvidence,
  isFinished,
  markDone,
  markSkipped,
  parseExecution,
  pendingCount,
  restartExecution,
  skippedCount,
} from '../../src/domain/execution.ts';
import {
  createSessionStore,
  parseSessionRecord,
  toPersistableSession,
  migrateSessionV1,
  migrateSessionV2,
  SESSION_SCHEMA_VERSION,
} from '../../src/storage/session-record.ts';
import { decideEnd } from '../../src/domain/session-lifecycle.ts';
import { buildActivityRecord } from '../../src/domain/activity-snapshot.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import {
  ACTIVITY_SCHEMA_VERSION,
  migrateActivityV1,
  parseActivityRecord,
  recordIdFor,
} from '../../src/storage/activity-record.ts';
import { generateFromView } from '../../src/programming/session-builder.ts';
import { projectGenerationView } from '../../src/domain/confirmation.ts';
import { candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';

const AT = '2026-08-27T10:00:00.000Z';

/* ---------- the model ---------- */

test('position is the resolved prefix, not a count of completions', () => {
  let e = EMPTY_EXECUTION;
  assert.equal(currentIndex(e), 0);
  e = markDone(e, 5);
  e = markSkipped(e, 5);
  e = markDone(e, 5);
  assert.equal(currentIndex(e), 3, 'a skip advances position like any other resolution');
  assert.equal(completedCount(e), 2);
  assert.equal(skippedCount(e), 1, 'and never counts as completed');
  assert.equal(pendingCount(e, 5), 2);
});

test('finished means nothing is pending — not that everything was completed', () => {
  const allDone = [1, 2, 3, 4, 5, 6, 7].reduce((e) => markDone(e, 7), EMPTY_EXECUTION);
  assert.equal(isFinished(allDone, 7), true);
  assert.equal(completedCount(allDone), 7);

  /* 5 completed + 2 skipped. Finished, and it must never read as 7 completed
     (§25.5, Invariant 11). */
  let mixed = EMPTY_EXECUTION;
  for (let i = 0; i < 5; i += 1) mixed = markDone(mixed, 7);
  for (let i = 0; i < 2; i += 1) mixed = markSkipped(mixed, 7);
  assert.equal(isFinished(mixed, 7), true, 'reaching the end is reaching the end');
  assert.equal(completedCount(mixed), 5, 'but only five were completed');
  assert.equal(skippedCount(mixed), 2);
  assert.notEqual(
    completedCount(mixed),
    7,
    'no derivation may turn a finished workout into seven completions',
  );
});

test('resolution never runs past the end of the workout', () => {
  let e = EMPTY_EXECUTION;
  for (let i = 0; i < 3; i += 1) e = markDone(e, 3);
  assert.equal(e.length, 3);
  assert.equal(markDone(e, 3).length, 3, 'no fourth result on a three-movement workout');
  assert.equal(markSkipped(e, 3).length, 3);
});

test('restart clears evidence and nothing else', () => {
  let e = EMPTY_EXECUTION;
  e = markDone(e, 4);
  e = markSkipped(e, 4);
  assert.equal(hasExecutionEvidence(e), true);
  const reset = restartExecution();
  assert.deepEqual(reset, []);
  assert.equal(hasExecutionEvidence(reset), false);
  assert.equal(currentIndex(reset), 0);
});

test('a persisted prefix is refused rather than repaired', () => {
  assert.deepEqual(parseExecution(['completed', 'skipped'], 5), ['completed', 'skipped']);
  assert.equal(parseExecution(['completed', 'completed'], 1), null, 'longer than the workout');
  assert.equal(parseExecution(['completed', 'pending'], 5), null, 'pending is never persisted');
  assert.equal(parseExecution(['done'], 5), null, 'unknown value');
  assert.equal(parseExecution('completed', 5), null, 'not an array');
  assert.equal(parseExecution(null, 5), null);
});

/* ---------- active session v3 ---------- */

const inventory = commitConfirmations(
  candidatesFrom(['park-bench', 'stairs'] as SupportedFeatureId[], AT),
  new Map<SupportedFeatureId, ConfirmationDecision>([
    ['park-bench' as SupportedFeatureId, 'present'],
    ['stairs' as SupportedFeatureId, 'present'],
  ]),
  AT,
).inventory;

const session = (over: Partial<ActiveSessionRecord> = {}): ActiveSessionRecord => ({
  sessionId: 'w-1',
  seed: 's-1',
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
  execution: EMPTY_EXECUTION,
  frozenView: projectGenerationView(inventory),
  ...over,
});

test('the execution prefix survives a persistence round trip', () => {
  const s = session({ execution: ['completed', 'skipped', 'completed'] });
  const back = parseSessionRecord(toPersistableSession(s));
  assert.deepEqual(back?.execution, ['completed', 'skipped', 'completed']);
  const persisted = JSON.parse(toPersistableSession(s)) as Record<string, unknown>;
  assert.equal(persisted['schemaVersion'], SESSION_SCHEMA_VERSION);
  assert.equal('done' in persisted, false, 'the scalar is gone, not shadowed');
});

test('a malformed execution prefix refuses the whole session', () => {
  const raw = JSON.stringify({
    schemaVersion: SESSION_SCHEMA_VERSION,
    sessionId: 'w-1',
    seed: 's-1',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: ['completed', 'pending'],
    frozenView: ['park-bench'],
  });
  assert.equal(parseSessionRecord(raw), null, 'never truncated, never padded');
});

test('a v2 session migrates its scalar to a completed prefix', () => {
  const v2 = {
    schemaVersion: 2,
    sessionId: 'w-legacy',
    seed: 's-legacy',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 3,
    frozenView: ['park-bench', 'stairs'],
  };
  const m = migrateSessionV2(v2);
  assert.equal(m.kind, 'migrated');
  if (m.kind !== 'migrated') return;
  assert.deepEqual(
    m.record.execution,
    ['completed', 'completed', 'completed'],
    'done = 3 proves three movements were marked Done, and nothing was skipped',
  );
  assert.equal(m.record.sessionId, 'w-legacy', 'identity carries across');
  assert.equal(m.record.seed, 's-legacy');
  assert.equal(m.record.minutes, 30);
  assert.deepEqual([...(m.record.frozenView?.usableFeatures ?? [])], ['park-bench', 'stairs']);
  assert.deepEqual(migrateSessionV2(v2), m, 'migration is deterministic');
});

test('a migrated-v1 session keeps its null frozen view; none is fabricated', () => {
  const m = migrateSessionV1({
    schemaVersion: 1,
    seed: 's-old',
    minutes: 20,
    goal: 'conditioning',
    conditions: 'acceptable',
    done: 2,
    completedAt: null,
    summary: null,
  });
  assert.equal(m.kind, 'migrated');
  if (m.kind !== 'migrated') return;
  assert.equal(m.record.frozenView, null, 'no venue projection is invented for a legacy session');
  assert.deepEqual(m.record.execution, ['completed', 'completed']);
  assert.equal(m.record.sessionId, 'v1-s-old', 'derived identity stays stable');
});

test('the v3 store reads back what it wrote', () => {
  const store = createSessionStore(createMemoryStorage());
  const s = session({ execution: ['skipped'] });
  store.write(s);
  assert.deepEqual(store.read()?.execution, ['skipped']);
  store.clear();
  assert.equal(store.read(), null);
});

/* ---------- terminal paths ---------- */

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

test('a finished workout records completed and skipped exactly as reported', () => {
  const base = session();
  const total = totalOf(base);
  assert.ok(total >= 4);

  let e = EMPTY_EXECUTION;
  for (let i = 0; i < total - 2; i += 1) e = markDone(e, total);
  e = markSkipped(e, total);
  e = markSkipped(e, total);

  const s = session({ execution: e });
  const w = workoutFor(s);
  assert.notEqual(w, null);
  if (w === null) return;
  const record = buildActivityRecord(s, w, { at: AT, localDate: '2026-08-27' });
  assert.notEqual(record, null);
  if (record === null) return;

  assert.equal(record.movements.length, total, 'every programmed movement is kept');
  assert.equal(record.movements.filter((m) => m.result === 'skipped').length, 2);
  assert.equal(record.movements.filter((m) => m.result === 'not-reached').length, 0, 'finished');
  assert.equal(record.movements.filter((m) => m.result === 'completed').length, total - 2);
  assert.notEqual(
    record.movements.filter((m) => m.result === 'completed').length,
    total,
    'a finished workout with skips must not read as all completed',
  );
});

test('an ended-early workout marks the rest not-reached and keeps them', () => {
  const base = session();
  const total = totalOf(base);
  assert.ok(total >= 5);

  let e = EMPTY_EXECUTION;
  for (let i = 0; i < 3; i += 1) e = markDone(e, total);
  e = markSkipped(e, total);

  const s = session({ execution: e });
  const w = workoutFor(s);
  if (w === null) return;
  const record = buildActivityRecord(s, w, { at: AT, localDate: '2026-08-27' });
  if (record === null) return;

  assert.equal(record.movements.length, total, 'nothing is dropped');
  assert.equal(record.movements.filter((m) => m.result === 'completed').length, 3);
  assert.equal(record.movements.filter((m) => m.result === 'skipped').length, 1);
  assert.equal(record.movements.filter((m) => m.result === 'not-reached').length, total - 4);
  assert.ok(
    record.movements.some((m) => m.result === 'not-reached'),
    'the presence of not-reached is what makes the outcome ended-early — no stored field',
  );
});

test('ending with no evidence records nothing', () => {
  assert.equal(decideEnd(session()).kind, 'no-evidence', 'a plan never begun is not a workout');
  assert.equal(decideEnd(session({ execution: ['skipped'] })).kind, 'record', 'a skip is evidence');
  assert.equal(decideEnd(session({ execution: ['completed'] })).kind, 'record');
});

test('finish later touches neither history nor the session', () => {
  const storage = createMemoryStorage();
  const sessions = createSessionStore(storage);
  const activity = createActivityStore(storage);
  const s = session({ execution: ['completed', 'skipped'] });
  sessions.write(s);

  /* Finish later is the absence of an operation: nothing is called. */
  assert.deepEqual(sessions.read()?.execution, ['completed', 'skipped'], 'still resumable');
  assert.equal(activity.list().length, 0, 'and it left no history');
});

test('restart preserves the workout and clears only the evidence', () => {
  const s = session({ execution: ['completed', 'skipped', 'completed'] });
  const before = workoutFor(s);
  const restarted = { ...s, execution: restartExecution() };
  const after = workoutFor(restarted);

  const shape = (w: ReturnType<typeof workoutFor>) =>
    w === null || w.kind === 'not-generated'
      ? null
      : w.blocks.flatMap((b) => b.items.map((i) => `${String(i.exerciseId)}:${JSON.stringify(i.prescription)}`));

  assert.deepEqual(shape(after), shape(before), 'same movements, same order, same prescriptions');
  assert.equal(restarted.sessionId, s.sessionId);
  assert.equal(restarted.seed, s.seed);
  assert.deepEqual(restarted.execution, []);
});

/* ---------- Activity v2 ---------- */

test('a v1 record migrates every movement to completed, and nothing else', () => {
  const v1 = {
    schemaVersion: 1,
    recordId: 'r-old',
    completedAt: '2026-08-20T09:00:00.000Z',
    localDate: '2026-08-20',
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
      },
      {
        exerciseId: 'plank',
        prescription: { kind: 'time', sets: 3, seconds: 30, counting: 'total' },
        blockName: 'Finish',
        featureId: null,
      },
    ],
    authorityTier: 'project-content',
  };

  const upgraded = migrateActivityV1(v1);
  const parsed = parseActivityRecord(upgraded);
  assert.notEqual(parsed, null);
  if (parsed === null) return;

  assert.equal(parsed.recordedAt, '2026-08-20T09:00:00.000Z', 'the value is unchanged');
  assert.equal('completedAt' in (upgraded as object), false, 'only the name was wrong');
  assert.deepEqual(
    parsed.movements.map((m) => m.result),
    ['completed', 'completed'],
    'a v1 record exists only if Done was pressed for every movement',
  );
  assert.equal(
    parsed.movements.some((m) => m.result !== 'completed'),
    false,
    'skipped and not-reached are never inferred — v1 could not produce them',
  );
  assert.deepEqual(parsed.movements.map((m) => m.exerciseId), ['step-up', 'plank'], 'order kept');
  assert.equal(parsed.recordId, 'r-old');
  assert.equal(parsed.localDate, '2026-08-20');
  assert.equal(parsed.kind, 'park-session');
  assert.deepEqual(parsed.featuresUsed, ['park-bench']);
});

test('v1 history is migrated on read rather than discarded', () => {
  const storage = createMemoryStorage();
  storage.setItem(
    'movehere:activity',
    JSON.stringify({
      schemaVersion: 1,
      records: [
        {
          schemaVersion: 1,
          recordId: 'r-v1',
          completedAt: '2026-08-20T09:00:00.000Z',
          localDate: '2026-08-20',
          kind: 'substitute-session',
          substituteReason: 'conditions-adverse',
          goal: 'conditioning',
          requestedMinutes: 20,
          conditions: 'adverse',
          featuresUsed: [],
          movements: [
            {
              exerciseId: 'plank',
              prescription: { kind: 'time', sets: 3, seconds: 30, counting: 'total' },
              blockName: 'Finish',
              featureId: null,
            },
          ],
          authorityTier: 'project-content',
        },
      ],
    }),
  );
  const result = createActivityStore(storage).read();
  assert.equal(result.records.length, 1, 'a version bump is not a reason to lose history');
  assert.equal(result.records[0]?.recordedAt, '2026-08-20T09:00:00.000Z');
  assert.equal(result.records[0]?.movements[0]?.result, 'completed');
  assert.equal(result.records[0]?.substituteReason, 'conditions-adverse', 'context preserved');
});

test('a record without movement results is refused', () => {
  const good = {
    schemaVersion: ACTIVITY_SCHEMA_VERSION,
    recordId: 'r-1',
    recordedAt: AT,
    localDate: '2026-08-27',
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
  };
  assert.notEqual(parseActivityRecord(good), null);
  const noResult = { ...good, movements: [{ ...good.movements[0], result: undefined }] };
  assert.equal(parseActivityRecord(noResult), null);
  const badResult = { ...good, movements: [{ ...good.movements[0], result: 'pending' }] };
  assert.equal(parseActivityRecord(badResult), null, 'pending is never a historical result');
});

/* ---------- quarantine, idempotency, recovery ---------- */

const v2Record = (id: string) => ({
  schemaVersion: ACTIVITY_SCHEMA_VERSION,
  recordId: id,
  recordedAt: AT,
  localDate: '2026-08-27',
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
});

test('an unreadable row survives an append', () => {
  const storage = createMemoryStorage();
  storage.setItem(
    'movehere:activity',
    JSON.stringify({
      schemaVersion: ACTIVITY_SCHEMA_VERSION,
      records: [{ schemaVersion: ACTIVITY_SCHEMA_VERSION, recordId: 'r-bad', movements: 'nope' }],
    }),
  );
  const store = createActivityStore(storage);
  const parsed = parseActivityRecord(v2Record('r-new'));
  assert.notEqual(parsed, null);
  if (parsed === null) return;
  store.append(parsed);

  const after = store.read();
  assert.deepEqual(after.records.map((r) => r.recordId), ['r-new']);
  assert.equal(after.quarantined, 1, 'the unreadable row is still there and still reported');
});

test('an unreadable row survives a delete', () => {
  const storage = createMemoryStorage();
  storage.setItem(
    'movehere:activity',
    JSON.stringify({
      schemaVersion: ACTIVITY_SCHEMA_VERSION,
      records: [
        v2Record('r-keep'),
        v2Record('r-go'),
        { schemaVersion: ACTIVITY_SCHEMA_VERSION, recordId: 'r-bad', movements: 'nope' },
      ],
    }),
  );
  const store = createActivityStore(storage);
  store.remove('r-go');

  const after = store.read();
  assert.deepEqual(after.records.map((r) => r.recordId), ['r-keep'], 'only the target went');
  assert.equal(after.quarantined, 1, 'deleting one workout must not purge an unrelated bad row');

  const stored = JSON.parse(storage.getItem('movehere:activity') ?? '{}') as {
    records: { recordId?: string }[];
  };
  assert.ok(stored.records.some((r) => r.recordId === 'r-bad'), 'it survives in storage');
});

test('both terminal paths share one record identity per session', () => {
  const store = createActivityStore(createMemoryStorage());
  const s = session({ execution: ['completed', 'skipped'] });
  const w = workoutFor(s);
  if (w === null) return;

  const endedEarly = buildActivityRecord(s, w, { at: AT, localDate: '2026-08-27' });
  if (endedEarly === null) return;
  assert.equal(endedEarly.recordId, recordIdFor(s.sessionId));
  assert.equal(store.append(endedEarly), 'appended');

  /* The same session finishing instead must not produce a second record. */
  const total = totalOf(s);
  const finishedSession = {
    ...s,
    execution: Array.from({ length: total }, () => 'completed' as const),
  };
  const finished = buildActivityRecord(finishedSession, w, { at: AT, localDate: '2026-08-27' });
  if (finished === null) return;
  assert.equal(finished.recordId, endedEarly.recordId, 'identity comes from the session');
  assert.equal(store.append(finished), 'duplicate');
  assert.equal(store.list().length, 1, 'one session, at most one record');
});

test('an interrupted terminal is reconciled, not duplicated', () => {
  const storage = createMemoryStorage();
  const sessions = createSessionStore(storage);
  const activity = createActivityStore(storage);
  const s = session({ execution: ['completed'] });
  const w = workoutFor(s);
  if (w === null) return;

  const record = buildActivityRecord(s, w, { at: AT, localDate: '2026-08-27' });
  if (record === null) return;
  activity.append(record);
  /* Interrupted here: the record exists, the session was never cleared. */
  sessions.write(s);

  assert.equal(activity.has(recordIdFor(s.sessionId)), true, 'recovery can see completion happened');
  assert.equal(activity.append(record), 'duplicate', 'and retrying appends nothing');
  assert.equal(activity.list().length, 1);
});
