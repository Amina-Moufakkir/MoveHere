/**
 * Activity history: append-only, idempotent, and survivable.
 *
 * The quarantine behaviour here is a deliberate divergence from the venue
 * boundary's fail-closed rule (§24.12). These tests exist so that a future
 * change restoring "consistency" between the two stores has to delete a test
 * that says why they differ.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMemoryStorage } from '../../src/storage/port.ts';
import { createActivityStore } from '../../src/storage/activity-store.ts';
import {
  parseActivityRecord,
  toPersistableActivityRecord,
  recordIdFor,
  ACTIVITY_SCHEMA_VERSION,
} from '../../src/storage/activity-record.ts';
import type { ActivityRecord } from '../../src/storage/activity-record.ts';

const KEY = 'movehere:activity';

const rec = (over: Partial<ActivityRecord> = {}): ActivityRecord => ({
  recordId: 'r-w-1',
  completedAt: '2026-08-26T10:00:00.000Z',
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
      blockName: 'Main',
      featureId: 'park-bench',
    },
  ],
  authorityTier: 'project-content',
  ...over,
});

test('append is idempotent by record identity', () => {
  const store = createActivityStore(createMemoryStorage());
  assert.equal(store.append(rec()), 'appended');
  assert.equal(store.append(rec()), 'duplicate', 'the same identity must not append twice');
  assert.equal(store.read().records.length, 1);
});

test('a repeated completion resolves to the same identifier', () => {
  assert.equal(recordIdFor('w-abc-1'), recordIdFor('w-abc-1'));
  assert.notEqual(recordIdFor('w-abc-1'), recordIdFor('w-abc-2'));
});

test('reads are newest first', () => {
  const store = createActivityStore(createMemoryStorage());
  store.append(rec({ recordId: 'r-1', completedAt: '2026-08-24T10:00:00.000Z' }));
  store.append(rec({ recordId: 'r-3', completedAt: '2026-08-26T10:00:00.000Z' }));
  store.append(rec({ recordId: 'r-2', completedAt: '2026-08-25T10:00:00.000Z' }));
  assert.deepEqual(
    store.list().map((r) => r.recordId),
    ['r-3', 'r-2', 'r-1'],
  );
});

test('lookup by id, and whole-record deletion', () => {
  const store = createActivityStore(createMemoryStorage());
  store.append(rec({ recordId: 'r-1' }));
  store.append(rec({ recordId: 'r-2' }));
  assert.equal(store.findById('r-2')?.recordId, 'r-2');
  assert.equal(store.has('r-2'), true);
  assert.equal(store.remove('r-2'), true);
  assert.equal(store.findById('r-2'), null);
  assert.equal(store.remove('r-2'), false, 'removing twice reports nothing removed');
  assert.equal(store.list().length, 1, 'the other record is untouched');
});

test('one invalid row is quarantined; valid history survives', () => {
  const storage = createMemoryStorage();
  storage.setItem(
    KEY,
    JSON.stringify({
      schemaVersion: ACTIVITY_SCHEMA_VERSION,
      records: [
        toPersistableActivityRecord(rec({ recordId: 'r-good-1' })),
        { schemaVersion: ACTIVITY_SCHEMA_VERSION, recordId: 'r-bad', movements: 'not an array' },
        toPersistableActivityRecord(rec({ recordId: 'r-good-2' })),
      ],
    }),
  );
  const store = createActivityStore(storage);
  const result = store.read();
  assert.equal(result.records.length, 2, 'valid rows are kept');
  assert.equal(result.quarantined, 1, 'and the loss is counted, not silent');
  assert.deepEqual(
    result.records.map((r) => r.recordId).sort(),
    ['r-good-1', 'r-good-2'],
  );
});

test('a duplicate id inside stored history is quarantined rather than trusted', () => {
  const storage = createMemoryStorage();
  storage.setItem(
    KEY,
    JSON.stringify({
      schemaVersion: ACTIVITY_SCHEMA_VERSION,
      records: [toPersistableActivityRecord(rec()), toPersistableActivityRecord(rec())],
    }),
  );
  const result = createActivityStore(storage).read();
  assert.equal(result.records.length, 1);
  assert.equal(result.quarantined, 1);
});

test('an unknown envelope version is reported, not overwritten', () => {
  const storage = createMemoryStorage();
  storage.setItem(KEY, JSON.stringify({ schemaVersion: 99, records: [] }));
  const store = createActivityStore(storage);
  assert.equal(store.read().envelopeUnreadable, true, 'history is not regenerable; say so');
});

test('record validation refuses fabricated shapes', () => {
  const base = toPersistableActivityRecord(rec()) as Record<string, unknown>;
  assert.notEqual(parseActivityRecord(base), null, 'the control case parses');
  assert.equal(parseActivityRecord({ ...base, localDate: '2026-02-30' }), null, 'impossible date');
  assert.equal(parseActivityRecord({ ...base, localDate: '26-08-26' }), null, 'wrong date shape');
  assert.equal(parseActivityRecord({ ...base, kind: 'super-session' }), null, 'invented kind');
  assert.equal(parseActivityRecord({ ...base, movements: [] }), null, 'a record with no movements');
  assert.equal(
    parseActivityRecord({ ...base, featuresUsed: [] }),
    null,
    'a park session that used no feature is a substitute (§11), not a park record',
  );
  assert.equal(
    parseActivityRecord({ ...base, authorityTier: 'reviewed-by-nobody' }),
    null,
    'authority tier is a closed set',
  );
  assert.equal(parseActivityRecord({ ...base, requestedMinutes: 37 }), null, 'duration is a fixed set');
});

test('the record carries no seed, venue id, or substitute flag', () => {
  const persisted = toPersistableActivityRecord(rec()) as Record<string, unknown>;
  for (const forbidden of ['seed', 'venueId', 'venueSnapshotId', 'wasSubstitute', 'userId', 'ownerId', 'generatorVersion', 'policyVersion']) {
    assert.equal(forbidden in persisted, false, `${forbidden} must not be historical evidence`);
  }
});
