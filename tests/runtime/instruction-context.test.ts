/**
 * Context-aware movement instructions (§8).
 *
 * The invariant under test throughout: the default completely constructs *its
 * own declared context*, and every supported generation context resolves to a
 * complete instruction — from the default alone or through phase overrides.
 * The unmodified default is not required to be valid everywhere.
 *
 * Two resolution shapes are worked below: an environment-independent default
 * overridden for a feature (split squat, grounded and on a bench), and a
 * feature default overridden for another feature (step-up, bench and stairs).
 *
 * Neither is the hanging knee raise. That was two movements sharing one entry —
 * the bar and the parallel bars differ in what supports the body, not in where
 * a limb is placed — and it has been split (§8). Keeping it as this contract's
 * worked example would have preserved the modelling mistake as the thing the
 * mechanism is demonstrated by.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX, EXERCISES } from '../../src/domain/exercise-catalog.ts';
import { resolveInstructions } from '../../src/domain/instruction-resolution.ts';
import type {
  AuthoredMatrix,
  Exercise,
  ExerciseId,
  InstructionState,
  MovementStep,
  PresentableAuthority,
} from '../../src/domain/exercise.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import type { SelectionBasis } from '../../src/domain/session.ts';

const PROJECT: PresentableAuthority = {
  status: 'project-content',
  authoredAt: '2026-08-23',
  basisRefs: ['test basis'],
};
const REVIEWED: PresentableAuthority = {
  status: 'reviewed',
  reviewedAt: '2026-08-23',
  reviewerRef: 'r',
  credentialRef: 'c',
  sourceRefs: ['s'],
  scope: 'general-fitness',
};

const step = (kind: MovementStep['kind'], text: string): MovementStep => ({ kind, text });

const BASE: readonly MovementStep[] = [
  step('setup', 'Stagger your stance with the rear foot on the ground'),
  step('action', 'Lower straight down until the front thigh is near parallel'),
  step('return', 'Push through the front foot to stand'),
];

/** Patches one named exercise, leaving the rest of the shipped catalog alone. */
const withInstructions = (id: string, state: InstructionState): AuthoredMatrix => ({
  ...AUTHORED_MATRIX,
  exercises: EXERCISES.map((e): Exercise => (String(e.id) === id ? { ...e, instructions: state } : e)),
});

const kinds = (r: ReturnType<typeof loadMatrix>): readonly string[] =>
  r.ok ? [] : r.failures.map((f) => f.kind);

const eiBasis: SelectionBasis = {
  kind: 'environment-independent',
  declarationId: 'ei-split-squat' as never,
  authority: { matrixVersion: '1' as never, tier: 'project-content', attestedAt: 't' },
};
const featureBasis = (featureId: string): SelectionBasis => ({
  kind: 'confirmed-feature',
  featureId: featureId as SupportedFeatureId,
  compatibilityId: 'x' as never,
  authority: { matrixVersion: '1' as never, tier: 'project-content', attestedAt: 't' },
});

const exerciseFrom = (r: ReturnType<typeof loadMatrix>, id: string): Exercise => {
  assert.ok(r.ok);
  const e = r.matrix.exercises.find((x) => String(x.id) === id);
  assert.ok(e !== undefined);
  return e;
};

/* --------------------------------------------------------- default context */

test('an environment-independent default requires that declaration', () => {
  // step-up has no EI declaration in the matrix.
  const result = loadMatrix(
    withInstructions('step-up', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [step('setup', 'Stand facing the step'), step('action', 'Drive through the top leg')],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(kinds(result).includes('instruction-context-uncited'));
});

test('a feature default requires a compatibility the matrix holds', () => {
  const result = loadMatrix(
    withInstructions('step-up', {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'hill' as SupportedFeatureId },
      steps: [step('setup', 'Stand facing the step'), step('action', 'Drive through the top leg')],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(kinds(result).includes('instruction-context-uncited'));
});

test('where the movement needs nothing, that is the baseline default', () => {
  // split-squat is environment-independent, so a bench default is not its baseline.
  const result = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'park-bench' as SupportedFeatureId },
      steps: [...BASE] as never,
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(kinds(result).includes('instruction-default-context-not-baseline'));
});

/* ---------------------------------------------------------------- overrides */

test('an override may only describe a context the matrix holds', () => {
  const result = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [...BASE] as never,
      overrides: [
        {
          featureId: 'stairs' as SupportedFeatureId, // split-squat is not cited with stairs
          replaces: 'setup',
          steps: [step('setup', 'Rear foot on a step')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(
    kinds(result).includes('instruction-context-uncited'),
    'instructions must not become a second way to assert a movement fits a structure',
  );
});

test('an override for the default context can never be selected', () => {
  const result = loadMatrix(
    withInstructions('hanging-knee-raise', {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'pull-up-bar' as SupportedFeatureId },
      steps: [step('setup', 'Hang from the bar'), step('action', 'Raise your knees')],
      overrides: [
        {
          featureId: 'pull-up-bar' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Hang from the bar again')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(kinds(result).includes('instruction-override-unreachable'));
});

test('an override must contain only the phase it replaces', () => {
  const result = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [...BASE] as never,
      overrides: [
        {
          featureId: 'park-bench' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Rear foot on the bench'), step('action', 'Lower straight down')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(kinds(result).includes('instruction-override-phase-mismatch'));
});

test('override text may not state how a number is counted', () => {
  const result = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [...BASE] as never,
      overrides: [
        {
          featureId: 'park-bench' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Rear foot on the bench, then switch sides')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(
    kinds(result).includes('instruction-states-counting'),
    'the prohibition applies to override text identically',
  );
});

/* -------------------------------------------------------------- phase order */

test('steps must be authored in phase order', () => {
  const result = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('action', 'Lower straight down'),
        step('setup', 'Stagger your stance'),
      ] as never,
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(
    kinds(result).includes('instruction-steps-out-of-phase-order'),
    'a phase must be a contiguous run, or replacing one is ambiguous',
  );
});

/* --------------------------------------------------------------- resolution */

test('the grounded split squat resolves differently on a bench', () => {
  const matrix = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [...BASE] as never,
      overrides: [
        {
          featureId: 'park-bench' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Stagger your stance with the rear foot on the bench seat')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(matrix.ok);
  const exercise = exerciseFrom(matrix, 'split-squat');

  const grounded = resolveInstructions(exercise, eiBasis);
  const benched = resolveInstructions(exercise, featureBasis('park-bench'));
  assert.ok(grounded.kind === 'authored' && benched.kind === 'authored');

  assert.match(grounded.steps[0].text, /on the ground/);
  assert.match(benched.steps[0].text, /on the bench seat/);

  // Only the setup differs. The action and return are authored once.
  assert.deepEqual(grounded.steps.slice(1), benched.steps.slice(1));
  assert.equal(grounded.steps.length, 3);
  assert.equal(benched.steps.length, 3);
});

test('a feature default resolves differently in another feature context', () => {
  // The feature-to-feature resolution path, which the environment-independent
  // split-squat case above does not exercise.
  //
  // This deliberately no longer uses hanging knee raise. That movement was two
  // movements wearing one entry — the bar and the parallel bars differ in what
  // supports the body, not in where a limb is placed — and it has been split
  // (§8). A test built on it would have preserved the modelling mistake as the
  // mechanism's worked example. Step-up is a real multi-context movement: the
  // same foot, on a different object.
  const matrix = loadMatrix(
    withInstructions('step-up', {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'park-bench' as SupportedFeatureId },
      steps: [
        step('setup', 'Stand facing the bench and place your whole foot on the seat'),
        step('action', 'Drive through the top leg to stand tall'),
        step('return', 'Step down under control'),
      ] as never,
      overrides: [
        {
          featureId: 'stairs' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Stand facing the stairs and place your whole foot on a step')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(matrix.ok);
  const exercise = exerciseFrom(matrix, 'step-up');

  const bench = resolveInstructions(exercise, featureBasis('park-bench'));
  const stairs = resolveInstructions(exercise, featureBasis('stairs'));
  assert.ok(bench.kind === 'authored' && stairs.kind === 'authored');

  assert.match(bench.steps[0].text, /on the seat/);
  assert.match(stairs.steps[0].text, /on a step/);
  // Only the setup differs; the action and return are authored once.
  assert.deepEqual(bench.steps.slice(1), stairs.steps.slice(1));
});

test('the split leaves the two knee raises as separate single-context movements', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);

  const contexts = (id: string) =>
    result.matrix.compatibilities
      .filter((c) => String(c.exerciseId) === id)
      .map((c) => String(c.featureId))
      .sort();

  assert.deepEqual(contexts('hanging-knee-raise'), ['pull-up-bar']);
  assert.deepEqual(contexts('supported-knee-raise'), ['parallel-bars']);

  // The variation label carried the identity difference and goes with it.
  const parallel = result.matrix.compatibilities.find(
    (c) => String(c.featureId) === 'parallel-bars',
  );
  assert.ok(parallel !== undefined);
  assert.equal(parallel.variationLabel, undefined);

  // No cue text is shared between them.
  const cuesOf = (id: string) =>
    result.matrix.exercises.find((e) => String(e.id) === id)?.cues ?? [];
  const overlap = cuesOf('supported-knee-raise').filter((c) =>
    cuesOf('hanging-knee-raise').includes(c),
  );
  assert.deepEqual(overlap, [], 'the new movement inherits no cue from the one it was split from');
});

test('resolution is deterministic and phase-ordered', () => {
  const matrix = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [...BASE] as never,
      overrides: [
        {
          featureId: 'park-bench' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Rear foot on the bench seat')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(matrix.ok);
  const exercise = exerciseFrom(matrix, 'split-squat');

  const a = resolveInstructions(exercise, featureBasis('park-bench'));
  const b = resolveInstructions(exercise, featureBasis('park-bench'));
  assert.deepEqual(a, b);
  assert.ok(a.kind === 'authored');
  assert.deepEqual(a.steps.map((s) => s.kind), ['setup', 'action', 'return']);
});

/* ---------------------------------------------------------------- authority */

test('a resolved instruction reports the weakest tier applied', () => {
  const matrix = loadMatrix(
    withInstructions('split-squat', {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [...BASE] as never,
      overrides: [
        {
          featureId: 'park-bench' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Rear foot on the bench seat')],
          authority: PROJECT,
        },
      ],
      authority: REVIEWED,
    }),
  );
  assert.ok(matrix.ok);
  const exercise = exerciseFrom(matrix, 'split-squat');

  const untouched = resolveInstructions(exercise, eiBasis);
  const overridden = resolveInstructions(exercise, featureBasis('park-bench'));
  assert.ok(untouched.kind === 'authored' && overridden.kind === 'authored');

  assert.equal(untouched.authority.status, 'reviewed', 'the default was reviewed');
  assert.equal(
    overridden.authority.status,
    'project-content',
    'an unreviewed override must not ride on the reviewed tier',
  );
});

/* ------------------------------------------------- states that do not resolve */

test('outstanding and not-required are context-free', () => {
  for (const state of [
    { kind: 'outstanding' } as const,
    { kind: 'not-required', reason: 'walking has no construction step' } as const,
  ]) {
    const matrix = loadMatrix(withInstructions('split-squat', state));
    assert.ok(matrix.ok);
    const exercise = exerciseFrom(matrix, 'split-squat');
    assert.deepEqual(resolveInstructions(exercise, eiBasis), state);
    assert.deepEqual(resolveInstructions(exercise, featureBasis('park-bench')), state);
  }
});

/* --------------------------------------------------------------- inheritance */

test('a context reading the default instruction is reported', () => {
  // step-up is cited with a bench and with stairs; a bench default with no
  // override means stairs reads prose authored for a bench.
  const matrix = loadMatrix(
    withInstructions('step-up', {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'park-bench' as SupportedFeatureId },
      steps: [
        step('setup', 'Stand facing the bench and place your whole foot on the seat'),
        step('action', 'Drive through the top leg to stand tall'),
        step('return', 'Step down under control'),
      ] as never,
      authority: PROJECT,
    }),
  );
  assert.ok(matrix.ok);
  const inherited = matrix.advisories.filter(
    (a) => a.kind === 'instruction-context-inherits-default',
  );
  assert.equal(inherited.length, 1);
  assert.deepEqual(
    inherited.map((a) => ('featureId' in a ? a.featureId : null)),
    ['stairs'],
    'inheriting is legitimate, and stays a decision someone made rather than a silence',
  );
});

/* ------------------------------------------------------- the shipped catalog */

test('the shipped catalog is untouched by this pass', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  const states = result.matrix.exercises.map((e) => e.instructions.kind);
  assert.equal(states.length, 23);
  assert.deepEqual([...new Set(states)], ['outstanding']);
  assert.equal(
    result.advisories.filter((a) => a.kind === 'instruction-context-inherits-default').length,
    0,
  );
});
