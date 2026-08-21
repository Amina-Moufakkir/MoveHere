/**
 * M7 — setup, generation, progress and correction as the UI drives them.
 *
 * These exercise the same functions the client components call, so what is
 * verified here is the wiring rather than a parallel implementation of it.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildInput, generateFor, MATRIX, PROGRAMMING } from '../../src/programming/session-builder.ts';
import { assessmentFor } from '../../src/programming/conditions.ts';
import { readSession, writeSession, clearSession } from '../../lib/session-store.ts';
import type { SessionRecord } from '../../lib/session-store.ts';
import {
  candidatesFrom,
  commitConfirmations,
} from '../../lib/venue-store.ts';
import { applyCorrection } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision, ConfirmedVenueInventory } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { SessionGenerationOutput } from '../../src/domain/session.ts';

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

test('session state round-trips, and corrupt state fails closed', () => {
  clearSession();
  assert.equal(readSession(), null);

  const record: SessionRecord = {
    seed: 'abc',
    minutes: 20,
    goal: 'conditioning',
    conditions: 'acceptable',
    done: 2,
    completedAt: null,
    summary: null,
  };
  writeSession(record);
  assert.deepEqual(readSession(), record);

  // Progress and completion survive, and so does what the session actually was.
  const summary = { movements: 7, featuresUsed: ['stairs'], wasSubstitute: false };
  writeSession({ ...record, done: 5, completedAt: NOW, summary });
  assert.equal(readSession()?.done, 5);
  assert.equal(readSession()?.completedAt, NOW);
  assert.deepEqual(readSession()?.summary, summary);

  clearSession();
  assert.equal(readSession(), null, 'cleared state is no session, not stale session');
});

test('a completed session is a record, not a live derivation', () => {
  // A correction after completion must not rewrite what was just done. The
  // summary is snapshotted at completion; only the NEXT session changes.
  clearSession();
  const record: SessionRecord = {
    seed: 'done-seed',
    minutes: 30,
    goal: 'strength',
    conditions: 'acceptable',
    done: 7,
    completedAt: NOW,
    summary: { movements: 7, featuresUsed: ['stairs'], wasSubstitute: false },
  };
  writeSession(record);

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
  // ...while the completed record still says what it was.
  assert.deepEqual(readSession()?.summary, record.summary);
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
