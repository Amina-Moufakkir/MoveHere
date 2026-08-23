/**
 * Context-aware movement instructions (§8).
 *
 * The invariant under test throughout: the default completely constructs *its
 * own declared context*, and every supported generation context resolves to a
 * complete instruction — from the default alone or through phase overrides.
 * The unmodified default is not required to be valid everywhere.
 *
 * The two shapes the catalog will need are the worked cases at the bottom:
 * a grounded split squat overridden for a bench, and a bar hang overridden for
 * a parallel-bar support hold.
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

test('the bar hang resolves to a support hold on parallel bars', () => {
  const matrix = loadMatrix(
    withInstructions('hanging-knee-raise', {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'pull-up-bar' as SupportedFeatureId },
      steps: [
        step('setup', 'Hang from the bar with your feet clear of the ground'),
        step('action', 'Raise your knees toward your chest'),
        step('return', 'Lower without swinging'),
      ] as never,
      overrides: [
        {
          featureId: 'parallel-bars' as SupportedFeatureId,
          replaces: 'setup',
          steps: [step('setup', 'Support yourself on the bars with your arms locked')],
          authority: PROJECT,
        },
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(matrix.ok);
  const exercise = exerciseFrom(matrix, 'hanging-knee-raise');

  const bar = resolveInstructions(exercise, featureBasis('pull-up-bar'));
  const bars = resolveInstructions(exercise, featureBasis('parallel-bars'));
  assert.ok(bar.kind === 'authored' && bars.kind === 'authored');

  assert.match(bar.steps[0].text, /Hang from the bar/);
  assert.match(bars.steps[0].text, /Support yourself on the bars/);
  assert.deepEqual(bar.steps.slice(1), bars.steps.slice(1));
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
  assert.equal(states.length, 22);
  assert.deepEqual([...new Set(states)], ['outstanding']);
  assert.equal(
    result.advisories.filter((a) => a.kind === 'instruction-context-inherits-default').length,
    0,
  );
});
