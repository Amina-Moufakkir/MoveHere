/**
 * The active-session store holds unfinished work only.
 *
 * Covers the v2 schema, the frozen generation view round trip, and the v1
 * migration boundary — including the one migration that must refuse rather
 * than invent.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMemoryStorage } from '../../src/storage/port.ts';
import {
  createSessionStore,
  parseSessionRecord,
  toPersistableSession,
  migrateSessionV1,
  SESSION_SCHEMA_VERSION,
} from '../../src/storage/session-record.ts';
import type { ActiveSessionRecord } from '../../src/storage/session-record.ts';
import { rehydrateGenerationView } from '../../src/domain/confirmation.ts';

const view = (ids: string[]) => rehydrateGenerationView(ids);

const record = (over: Partial<ActiveSessionRecord> = {}): ActiveSessionRecord => ({
  sessionId: 'w-abc-1',
  seed: 's-abc-1',
  minutes: 30,
  goal: 'strength',
  conditions: 'acceptable',
  execution: ['completed', 'completed'],
  frozenView: view(['park-bench', 'stairs']),
  ...over,
});

test('a completed session cannot be represented: the fields do not exist', () => {
  const persisted = JSON.parse(toPersistableSession(record())) as Record<string, unknown>;
  assert.equal('completedAt' in persisted, false, 'completedAt must not be persisted');
  assert.equal('summary' in persisted, false, 'summary must not be persisted');
  assert.equal(persisted['schemaVersion'], SESSION_SCHEMA_VERSION);
});

test('the frozen generation view survives a persistence round trip', () => {
  const restored = parseSessionRecord(toPersistableSession(record()));
  assert.notEqual(restored, null);
  assert.deepEqual(
    [...(restored?.frozenView?.usableFeatures ?? [])],
    ['park-bench', 'stairs'],
    'the frozen view must come back with the same members',
  );
  assert.equal(
    restored?.frozenView?.snapshotId,
    record().frozenView?.snapshotId,
    'and the same snapshot identity, or it is not the same view',
  );
});

test('a null frozen view is a fact, not a failure', () => {
  const restored = parseSessionRecord(toPersistableSession(record({ frozenView: null })));
  assert.notEqual(restored, null, 'a session with no usable venue is still a session');
  assert.equal(restored?.frozenView, null);
});

test('an unreadable frozen view refuses the whole session', () => {
  const raw = JSON.stringify({
    schemaVersion: SESSION_SCHEMA_VERSION,
    sessionId: 'w-1',
    seed: 's-1',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    execution: [],
    frozenView: ['park-bench', 'not-a-real-feature'],
  });
  assert.equal(
    parseSessionRecord(raw),
    null,
    'a session that cannot be faithfully resumed must not be half-restored',
  );
});

test('rehydrating a view refuses duplicates and non-arrays', () => {
  assert.equal(rehydrateGenerationView(['park-bench', 'park-bench']), null);
  assert.equal(rehydrateGenerationView('park-bench'), null);
  assert.equal(rehydrateGenerationView(null), null);
});

test('rehydrated views sort, so member order cannot change identity', () => {
  const a = rehydrateGenerationView(['stairs', 'park-bench']);
  const b = rehydrateGenerationView(['park-bench', 'stairs']);
  assert.equal(a?.snapshotId, b?.snapshotId);
});

test('an unfinished v1 session migrates, carrying no frozen view', () => {
  const v1 = {
    schemaVersion: 1,
    seed: 's-old-1',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 3,
    completedAt: null,
    summary: null,
  };
  const migration = migrateSessionV1(v1);
  assert.equal(migration.kind, 'migrated');
  if (migration.kind !== 'migrated') return;
  assert.deepEqual(migration.record.execution, ['completed','completed','completed'], 'position and evidence are preserved');
  assert.equal(migration.record.seed, 's-old-1');
  assert.equal(migration.record.frozenView, null, 'v1 had no frozen view to carry');
  assert.equal(
    migrateSessionV1(v1).record?.sessionId,
    migration.record.sessionId,
    'migrating twice must yield the same identity',
  );
});

test('a completed v1 session is dropped, never turned into history', () => {
  const migration = migrateSessionV1({
    schemaVersion: 1,
    seed: 's-old-2',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 7,
    completedAt: '2026-08-20T10:00:00.000Z',
    summary: { movements: 7, featuresUsed: ['park-bench'], wasSubstitute: false },
  });
  assert.equal(migration.kind, 'dropped');
  if (migration.kind !== 'dropped') return;
  assert.equal(
    migration.reason,
    'completed-v1',
    'v1 never stored movements; reconstructing them from current inventory would be fabrication',
  );
});

test('the store reads back what it wrote, and clears', () => {
  const store = createSessionStore(createMemoryStorage());
  assert.equal(store.read(), null);
  store.write(record());
  assert.equal(store.read()?.sessionId, 'w-abc-1');
  store.clear();
  assert.equal(store.read(), null);
});
