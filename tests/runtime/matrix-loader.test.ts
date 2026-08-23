/**
 * M2 — matrix validation boundary.
 *
 * The catalog is project content; these tests check the boundary that decides
 * what may reach a user, not whether the programming is any good.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX, EXERCISES } from '../../src/domain/exercise-catalog.ts';
import type {
  AuthoredMatrix,
  ExerciseId,
  MatrixVersion,
  ContentAuthority,
  ExerciseCompatibility,
  CompatibilityEntryId,
} from '../../src/domain/exercise.ts';
import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';

const PROJECT: ContentAuthority = {
  status: 'project-content',
  authoredAt: 't',
  basisRefs: ['test basis'],
};

const load = (over: Partial<AuthoredMatrix>) => loadMatrix({ ...AUTHORED_MATRIX, ...over });

const failureKinds = (result: ReturnType<typeof loadMatrix>): readonly string[] =>
  result.ok ? [] : result.failures.map((f) => f.kind);

test('the shipped catalog loads', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.matrix.authorityTier, 'project-content');
  assert.ok(result.matrix.compatibilities.length > 0);
  assert.ok(result.matrix.environmentIndependent.length > 0);
});

test('the shipped catalog is project content, not reviewed', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  for (const entry of result.matrix.compatibilities) {
    assert.equal(entry.authority.status, 'project-content');
  }
});

test('squat, hinge, push and core each have two environment-independent options', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  const counts = new Map<string, number>();
  for (const entry of result.matrix.environmentIndependent) {
    const pattern = EXERCISES.find((e) => e.id === entry.exerciseId)?.pattern ?? '?';
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }
  for (const pattern of ['squat', 'hinge', 'push', 'core']) {
    assert.ok((counts.get(pattern) ?? 0) >= 2, `${pattern} needs two environment-independent options`);
  }
});

test('every supported feature carries at least one movement', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  for (const feature of FEATURE_REGISTRY.supported) {
    const count = result.matrix.compatibilities.filter((c) => c.featureId === feature.id).length;
    assert.ok(count >= 1, `${feature.id} carries no movements`);
  }
});

test('true pulling is unavailable without a supported feature', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  const eiPull = result.matrix.environmentIndependent.filter(
    (e) => EXERCISES.find((x) => x.id === e.exerciseId)?.pattern === 'pull',
  );
  assert.equal(eiPull.length, 0, 'no substitute may stand in for pulling');
  const barPull = result.matrix.compatibilities.filter(
    (c) => EXERCISES.find((x) => x.id === c.exerciseId)?.pattern === 'pull',
  );
  assert.ok(barPull.every((c) => c.featureId === 'pull-up-bar'));
});

test('content gaps are reported as advisories, not hidden', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  assert.deepEqual(
    result.advisories.filter((a) => a.kind === 'feature-without-movements'),
    [],
    'no supported feature should be confirmable but inert',
  );
  assert.ok(
    result.advisories.some(
      (a) => a.kind === 'thin-environment-independent-pattern' && a.pattern === 'pull' && a.count === 0,
    ),
    'the pull gap must be reported, not hidden',
  );
});

test('draft entries are dropped and reported', () => {
  const draft: ExerciseCompatibility = {
    id: 'draft-entry' as CompatibilityEntryId,
    exerciseId: 'plank' as ExerciseId,
    featureId: 'park-bench',
    authority: { status: 'draft' },
  };
  const result = load({ compatibilities: [...AUTHORED_MATRIX.compatibilities, draft] });
  assert.ok(result.ok);
  assert.ok(!result.matrix.compatibilities.some((c) => c.id === 'draft-entry'));
  assert.deepEqual(result.dropped, [{ id: 'draft-entry', exerciseId: 'plank', reason: 'draft' }]);
});

test('a claim referencing an unknown exercise is rejected', () => {
  const result = load({
    compatibilities: [
      ...AUTHORED_MATRIX.compatibilities,
      { id: 'x' as CompatibilityEntryId, exerciseId: 'moon-jump' as ExerciseId, featureId: 'park-bench', authority: PROJECT },
    ],
  });
  assert.ok(failureKinds(result).includes('unknown-exercise-id'));
});

test('a claim referencing an excluded Class C object is rejected', () => {
  const result = load({
    compatibilities: [
      ...AUTHORED_MATRIX.compatibilities,
      {
        id: 'y' as CompatibilityEntryId,
        exerciseId: 'incline-push-up' as ExerciseId,
        featureId: 'picnic-table' as ExerciseCompatibility['featureId'],
        authority: PROJECT,
      },
    ],
  });
  assert.ok(failureKinds(result).includes('excluded-feature-referenced'));
});

test('duplicate ids are rejected', () => {
  const first = AUTHORED_MATRIX.compatibilities[0];
  assert.ok(first);
  const result = load({ compatibilities: [...AUTHORED_MATRIX.compatibilities, first] });
  assert.ok(failureKinds(result).includes('duplicate-id'));
});

test('unsourced project content is rejected', () => {
  const result = load({
    compatibilities: [
      ...AUTHORED_MATRIX.compatibilities,
      {
        id: 'z' as CompatibilityEntryId,
        exerciseId: 'plank' as ExerciseId,
        featureId: 'park-bench',
        authority: { status: 'project-content', authoredAt: 't', basisRefs: [] as unknown as ContentAuthority extends { basisRefs: infer B } ? B : never },
      },
    ],
  });
  assert.ok(failureKinds(result).includes('unsourced-content'));
});

test('an exercise reachable by no route is rejected', () => {
  const result = load({
    exercises: [
      ...EXERCISES,
      {
        id: 'ghost-move' as ExerciseId,
        name: 'Ghost move',
        pattern: 'core',
        laterality: 'bilateral',
        prescriptionKinds: ['reps'],
        countingModes: ['total'],
        cues: ['nothing'],
      },
    ],
  });
  assert.ok(failureKinds(result).includes('orphan-exercise'));
});

test('an empty matrix is rejected rather than loading as valid', () => {
  const result = loadMatrix({
    version: 'x' as MatrixVersion,
    exercises: [],
    compatibilities: [],
    environmentIndependent: [],
  });
  assert.ok(failureKinds(result).includes('empty-collection'));
});

test('a mixed-authority matrix reports the weaker tier', () => {
  const reviewed: ContentAuthority = {
    status: 'reviewed',
    reviewedAt: 't',
    reviewerRef: 'r',
    credentialRef: 'c',
    sourceRefs: ['s'],
    scope: 'general-fitness',
  };
  const result = load({
    compatibilities: AUTHORED_MATRIX.compatibilities.map((c) => ({ ...c, authority: reviewed })),
  });
  assert.ok(result.ok);
  // Environment-independent entries are still project content.
  assert.equal(result.matrix.authorityTier, 'project-content');
});

test('loading is pure and reads no clock', () => {
  const realDate = globalThis.Date;
  const realRandom = Math.random;
  globalThis.Date = new Proxy(realDate, {
    construct: () => { throw new Error('clock read'); },
    apply: () => { throw new Error('clock read'); },
    get: (t, p, r) => { if (p === 'now') throw new Error('clock read'); return Reflect.get(t, p, r) as unknown; },
  }) as DateConstructor;
  Math.random = () => { throw new Error('randomness used'); };
  try {
    assert.ok(loadMatrix(AUTHORED_MATRIX).ok);
  } finally {
    globalThis.Date = realDate;
    Math.random = realRandom;
  }
});
