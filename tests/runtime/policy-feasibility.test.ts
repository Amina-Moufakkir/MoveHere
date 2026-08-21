/**
 * M3 — policy loading and matrix × policy feasibility.
 *
 * These test the boundary, not whether the programming is any good. Whether
 * these prescriptions are sensible is a question for professional review,
 * which this project content has not had.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../../src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from '../../src/domain/policy-loader.ts';
import { AUTHORED_POLICIES, STRENGTH_POLICY } from '../../src/domain/policy-catalog.ts';
import { checkFeasibility, selectPolicy } from '../../src/domain/feasibility.ts';
import { SESSION_DURATIONS } from '../../src/domain/session.ts';
import type { AuthoredGoalPolicy } from '../../src/domain/policy.ts';

const matrix = (() => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  return result.matrix;
})();

const policies = (() => {
  const result = loadGoalPolicies(AUTHORED_POLICIES);
  assert.ok(result.ok);
  return result.policies;
})();

test('the shipped policies load as project content', () => {
  assert.equal(policies.authorityTier, 'project-content');
});

test('the shipped content is feasible', () => {
  const result = checkFeasibility(matrix, policies);
  assert.equal(result.ok, true);
});

test('policy selection is total and returns the matching goal', () => {
  const result = checkFeasibility(matrix, policies);
  assert.ok(result.ok);
  assert.equal(selectPolicy(result.programming, 'strength').goal, 'strength');
  assert.equal(selectPolicy(result.programming, 'conditioning').goal, 'conditioning');
});

test('every required slot is satisfiable from the environment-independent pool', () => {
  const byId = new Map(matrix.exercises.map((e) => [e.id as string, e]));
  const ei = matrix.environmentIndependent.map((e) => byId.get(e.exerciseId));
  for (const goal of ['strength', 'conditioning'] as const) {
    for (const duration of SESSION_DURATIONS) {
      for (const block of policies.byGoal[goal].programs[duration].blocks) {
        for (const slot of block.slots) {
          const required =
            slot.obligation['venue-aware'] === 'required' || slot.obligation.substitute === 'required';
          if (!required) continue;
          assert.ok(
            ei.some(
              (e) =>
                e !== undefined &&
                slot.eligiblePatterns.includes(e.pattern) &&
                e.prescriptionKinds.includes(slot.prescription.kind),
            ),
            `${goal} ${duration} ${slot.id} is required but not environment-independent`,
          );
        }
      }
    }
  }
});

test('no pull slot is ever required, because pull has no environment-independent option', () => {
  for (const goal of ['strength', 'conditioning'] as const) {
    for (const duration of SESSION_DURATIONS) {
      for (const block of policies.byGoal[goal].programs[duration].blocks) {
        for (const slot of block.slots) {
          if (!slot.eligiblePatterns.includes('pull')) continue;
          assert.equal(slot.obligation['venue-aware'], 'optional', slot.id);
          assert.equal(slot.obligation.substitute, 'optional', slot.id);
        }
      }
    }
  }
});

test('a required pull slot makes the content infeasible', () => {
  const [firstBlock, ...restBlocks] = STRENGTH_POLICY.programs[10].blocks;
  const broken: AuthoredGoalPolicy = {
    ...STRENGTH_POLICY,
    programs: {
      ...STRENGTH_POLICY.programs,
      10: {
        ...STRENGTH_POLICY.programs[10],
        blocks: [
          {
            ...firstBlock,
            slots: firstBlock.slots.map((s) =>
              s.eligiblePatterns.includes('pull')
                ? { ...s, obligation: { 'venue-aware': 'required' as const, substitute: 'required' as const } }
                : s,
            ) as typeof firstBlock.slots,
          },
          ...restBlocks,
        ],
      },
    },
  };
  const loaded = loadGoalPolicies([broken, AUTHORED_POLICIES[1]!]);
  assert.ok(loaded.ok);
  const result = checkFeasibility(matrix, loaded.policies);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((e) => e.kind === 'required-slot-unsatisfiable'));
  }
});

test('demoting a substitute-required slot is caught by the fill floor', () => {
  const [firstBlock, ...restBlocks] = STRENGTH_POLICY.programs[45].blocks;
  const gutted: AuthoredGoalPolicy = {
    ...STRENGTH_POLICY,
    programs: {
      ...STRENGTH_POLICY.programs,
      45: {
        ...STRENGTH_POLICY.programs[45],
        blocks: [
          firstBlock,
          ...restBlocks.map((b) => ({
            ...b,
            slots: b.slots.map((s) => ({
              ...s,
              obligation: { ...s.obligation, substitute: 'optional' as const },
            })) as typeof b.slots,
          })),
        ],
      },
    },
  };
  const loaded = loadGoalPolicies([gutted, AUTHORED_POLICIES[1]!]);
  assert.ok(loaded.ok);
  const result = checkFeasibility(matrix, loaded.policies);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.some((e) => e.kind === 'substitute-underfills-duration'));
  }
});

test('no program exceeds the time the user asked for', () => {
  const result = checkFeasibility(matrix, policies);
  assert.ok(result.ok);
  assert.ok(!result.advisories.some((a) => a.kind === 'program-underfills-duration'));
});

test('every goal and duration can be changed by a confirmed venue feature', () => {
  const result = checkFeasibility(matrix, policies);
  assert.ok(result.ok);
  assert.deepEqual(
    result.advisories.filter((a) => a.kind === 'venue-features-do-not-differentiate'),
    [],
    'a session no feature can change would fail Gate I by construction',
  );
});

test('a policy set missing a supported goal is rejected', () => {
  const result = loadGoalPolicies([STRENGTH_POLICY]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.failures.some((f) => f.kind === 'missing-goal'));
});

test('draft policy is dropped and reported', () => {
  const draft: AuthoredGoalPolicy = { ...STRENGTH_POLICY, authority: { status: 'draft' } };
  const result = loadGoalPolicies([draft, AUTHORED_POLICIES[1]!]);
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.failures.some((f) => f.kind === 'missing-goal'));
});

test('feasibility is pure and reads no clock', () => {
  const realDate = globalThis.Date;
  const realRandom = Math.random;
  globalThis.Date = new Proxy(realDate, {
    construct: () => { throw new Error('clock read'); },
    apply: () => { throw new Error('clock read'); },
    get: (t, p, r) => { if (p === 'now') throw new Error('clock read'); return Reflect.get(t, p, r) as unknown; },
  }) as DateConstructor;
  Math.random = () => { throw new Error('randomness used'); };
  try {
    assert.ok(checkFeasibility(matrix, policies).ok);
  } finally {
    globalThis.Date = realDate;
    Math.random = realRandom;
  }
});
