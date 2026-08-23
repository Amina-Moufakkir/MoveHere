/**
 * Counting compatibility (§8).
 *
 * A prescription states a number; counting states what that number means. When
 * nothing proved the two agreed, 1,315 of 3,480 generated items — 38% — carried
 * a count that contradicted the movement it described: split squats counted
 * total, glute bridges told "per side". The evidence and the cause are in
 * `docs/counting-compatibility-audit.md`.
 *
 * The sweep below is the test that would have caught it. The structural tests
 * around it catch the same defect earlier and say more about why.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { generateSession } from '../../src/domain/generator.ts';
import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../../src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from '../../src/domain/policy-loader.ts';
import { AUTHORED_POLICIES } from '../../src/domain/policy-catalog.ts';
import { checkFeasibility, selectPolicy } from '../../src/domain/feasibility.ts';
import { canFill } from '../../src/domain/slot-eligibility.ts';
import { makeSessionMinutes, SESSION_DURATIONS } from '../../src/domain/session.ts';
import { seedFrom } from '../../src/domain/prng.ts';
import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';
import { confirmInventory, projectGenerationView } from '../../src/domain/confirmation.ts';
import type { VenueId } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { Exercise, RepCounting } from '../../src/domain/exercise.ts';
import type { SessionGoal } from '../../src/domain/session.ts';

/* --------------------------------------------------------------- fixtures */

const matrix = (() => {
  const r = loadMatrix(AUTHORED_MATRIX);
  assert.ok(r.ok);
  return r.matrix;
})();

const programming = (() => {
  const p = loadGoalPolicies(AUTHORED_POLICIES);
  assert.ok(p.ok);
  const f = checkFeasibility(matrix, p.policies);
  assert.ok(f.ok);
  return f;
})();

const GOALS: readonly SessionGoal[] = ['strength', 'conditioning'];
const ALL_FEATURES = FEATURE_REGISTRY.supported.map((f) => f.id);

const viewOf = (features: readonly SupportedFeatureId[]) => {
  const { inventory } = confirmInventory({
    venueId: 'v' as VenueId,
    candidates: features.map((featureId) => ({
      featureId,
      source: { kind: 'manual-selection' as const },
      observedAt: 't',
    })),
    confirmations: features.map((featureId) => ({
      featureId,
      decision: 'present' as const,
      decidedAt: 't',
      candidateSource: { kind: 'manual-selection' as const },
    })),
    at: 't',
  });
  return projectGenerationView(inventory);
};

const byId = new Map(matrix.exercises.map((e) => [e.id as string, e]));
const allSlots = GOALS.flatMap((goal) =>
  SESSION_DURATIONS.flatMap((duration) =>
    selectPolicy(programming.programming, goal)
      .programs[duration].blocks.flatMap((b) => [...b.slots]),
  ),
);

/* ------------------------------------------------------------------ sweep */

test('no generated item is counted a way its movement does not accept', () => {
  const offenders = new Map<string, number>();
  let items = 0;

  for (const goal of GOALS) {
    for (const minutes of SESSION_DURATIONS) {
      for (let seed = 0; seed < 60; seed++) {
        for (const features of [ALL_FEATURES, []]) {
          const out = generateSession({
            context:
              features.length > 0
                ? { kind: 'venue-aware', venue: viewOf(features) }
                : { kind: 'environment-independent' },
            policy: selectPolicy(programming.programming, goal),
            matrix,
            availableMinutes: makeSessionMinutes(minutes)!,
            conditions: { kind: 'park-permitted' },
            seed: seedFrom(`counting-${goal}-${minutes}-${seed}`),
          });
          if (out.kind !== 'park-session' && out.kind !== 'substitute-session') continue;

          for (const block of out.blocks) {
            for (const item of block.items) {
              items++;
              if (!('counting' in item.prescription)) continue;
              const exercise = byId.get(item.exerciseId as string);
              assert.ok(exercise !== undefined);
              if (!exercise.countingModes.includes(item.prescription.counting)) {
                const key = `${String(item.exerciseId)} counted '${item.prescription.counting}'`;
                offenders.set(key, (offenders.get(key) ?? 0) + 1);
              }
            }
          }
        }
      }
    }
  }

  // Guards the guard: a sweep that generated nothing would pass vacuously.
  assert.ok(items > 3000, `the sweep must actually generate sessions, got ${items}`);
  assert.deepEqual(
    [...offenders.entries()],
    [],
    'a prescribed count must mean something for the movement it describes (§8)',
  );
});

/* ------------------------------------------------------------- structural */

test('no shipped slot can be filled by a movement that rejects its counting', () => {
  const bad: string[] = [];
  for (const slot of allSlots) {
    if (!('counting' in slot.prescription)) continue;
    for (const exercise of matrix.exercises) {
      if (canFill(exercise, slot) && !exercise.countingModes.includes(slot.prescription.counting)) {
        bad.push(`${String(slot.id)} accepts ${String(exercise.id)}`);
      }
    }
  }
  assert.deepEqual(bad, [], 'eligibility must prove counting, not merely render it');
});

test('eligibility rejects a counting the movement does not accept', () => {
  const slot = allSlots.find(
    (s) => 'counting' in s.prescription && s.prescription.counting === 'per-side',
  );
  assert.ok(slot !== undefined, 'the shipped policy must exercise per-side counting somewhere');

  const totalOnly = matrix.exercises.filter(
    (e) => e.countingModes.length === 1 && e.countingModes[0] === 'total',
  );
  assert.ok(totalOnly.length > 0);
  for (const exercise of totalOnly) {
    assert.equal(
      canFill(exercise, slot),
      false,
      `${String(exercise.id)} accepts only total counting and must not fill a per-side slot`,
    );
  }
});

/* ------------------------------------------------ the derivation that isn't */

test('gait movements are counted total despite unilateral laterality', () => {
  // The reason countingModes is authored rather than derived. Deriving from
  // laterality prescribes "walk two minutes per side".
  for (const id of ['brisk-walk', 'easy-run', 'march-in-place', 'shuttle-run']) {
    const exercise = byId.get(id);
    assert.ok(exercise !== undefined, `${id} must exist in the catalog`);
    assert.equal(exercise.laterality, 'unilateral', `${id} alternates legs`);
    assert.deepEqual(
      [...exercise.countingModes],
      ['total'],
      `${id} is gait: it alternates sides and is still counted as one effort`,
    );
  }
});

test('countingModes is not a restatement of laterality', () => {
  const derived = (e: Exercise): readonly RepCounting[] =>
    e.laterality === 'unilateral' ? ['per-side'] : ['total'];
  const divergent = matrix.exercises.filter(
    (e) => JSON.stringify([...e.countingModes]) !== JSON.stringify(derived(e)),
  );
  assert.ok(
    divergent.length > 0,
    'if every assignment matched the laterality derivation, the field would be redundant ' +
      'and the derivation this defect ruled out would have been correct after all',
  );
});

/* -------------------------------------------------------------- reachability */

test('narrowing by counting leaves every movement reachable', () => {
  // The variety guard. Satisfying the proof by excluding movements until it
  // passes is a regression, not a fix.
  const reachable = new Set<string>();
  for (const slot of allSlots) {
    for (const exercise of matrix.exercises) {
      if (canFill(exercise, slot)) reachable.add(exercise.id as string);
    }
  }
  const unreachable = matrix.exercises
    .map((e) => e.id as string)
    .filter((id) => !reachable.has(id))
    .sort();
  assert.deepEqual(unreachable, [], 'no movement may be stranded by counting narrowing');
});
