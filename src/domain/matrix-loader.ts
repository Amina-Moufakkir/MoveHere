/**
 * Matrix validation boundary (§8).
 *
 * Authored content is untrusted at this boundary, exactly as persisted venue
 * state is. Only the loader can produce a ValidatedMatrix, because referential
 * integrity is a process fact rather than something visible in an entry.
 *
 * Draft entries are dropped and reported. Silently filtering them would make a
 * half-authored matrix look complete.
 */

import type {
  AuthoredMatrix,
  InstructionState,
  MovementStep,
  MovementStepKind,
  ContentAuthority,
  ExerciseCompatibility,
  ExerciseId,
  EnvironmentIndependentMovement,
  MatrixVersion,
  MovementPattern,
  PresentableAuthority,
  Exercise,
} from './exercise.ts';
import { isSupportedFeatureId, FEATURE_REGISTRY } from './feature-registry.ts';
import { PHASE_ORDER, instructionContextsFor } from './instruction-resolution.ts';

type NonEmpty<T> = readonly [T, ...T[]];

/** A compatibility claim eligible to reach a user. */
export type UsableCompatibility = ExerciseCompatibility & { readonly authority: PresentableAuthority };

/** An environment-independence declaration eligible to reach a user. */
export type UsableEnvironmentIndependentMovement = EnvironmentIndependentMovement & {
  readonly authority: PresentableAuthority;
};

declare const matrixWitness: unique symbol;

/**
 * A matrix that passed validation.
 *
 * Branded because referential integrity is a process fact: you cannot tell by
 * inspecting an entry whether its exerciseId resolves, whether its featureId is
 * Class C, or whether another entry shares its id. Only this module can produce
 * one, and only usable entries survive into it.
 */
export interface ValidatedMatrix {
  readonly [matrixWitness]: true;
  readonly version: MatrixVersion;
  /** The weakest authority present. A session's provenance label follows this. */
  readonly authorityTier: PresentableAuthority['status'];
  readonly exercises: readonly Exercise[];
  readonly compatibilities: readonly UsableCompatibility[];
  readonly environmentIndependent: readonly UsableEnvironmentIndependentMovement[];
}

/** An entry excluded from the validated matrix, reported rather than silently dropped. */
export interface DroppedEntry {
  readonly id: string;
  readonly exerciseId: ExerciseId;
  readonly reason: 'draft';
}

export type MatrixValidationFailure =
  | { readonly kind: 'malformed'; readonly detail: string }
  | { readonly kind: 'unknown-exercise-id'; readonly found: unknown; readonly at: string }
  | { readonly kind: 'excluded-feature-referenced'; readonly found: unknown; readonly at: string }
  | { readonly kind: 'duplicate-id'; readonly id: string }
  | { readonly kind: 'unsourced-content'; readonly id: string }
  | { readonly kind: 'empty-collection'; readonly at: string }
  | { readonly kind: 'orphan-exercise'; readonly exerciseId: ExerciseId }
  | { readonly kind: 'pattern-unreachable'; readonly pattern: MovementPattern }
  | {
      /**
       * An authored instruction that does not describe a whole movement.
       *
       * A set of steps beginning mid-movement reads as complete and is not, so
       * setup and action are both required. `return` stays optional: a static
       * hold has no repetition to complete.
       */
      readonly kind: 'instruction-missing-required-step';
      readonly exerciseId: ExerciseId;
      readonly missing: readonly MovementStepKind[];
    }
  | {
      /** Steps out of phase order: an action before a setup, a return before an action. */
      readonly kind: 'instruction-steps-out-of-phase-order';
      readonly exerciseId: ExerciseId;
    }
  | {
      /**
       * A declared context the matrix does not hold for this movement.
       *
       * Applies to the default context and to every override. Instruction
       * content must never become a second way to assert that a movement can be
       * performed on a structure — the rule exercise visuals already obey.
       */
      readonly kind: 'instruction-context-uncited';
      readonly exerciseId: ExerciseId;
      readonly context: string;
    }
  | {
      /**
       * A default context that is not the movement's baseline.
       *
       * Where an environment-independent declaration exists, the form
       * performable anywhere is the one a baseline description should describe.
       */
      readonly kind: 'instruction-default-context-not-baseline';
      readonly exerciseId: ExerciseId;
    }
  | {
      /** An override that can never be selected: it repeats the default context or another override. */
      readonly kind: 'instruction-override-unreachable';
      readonly exerciseId: ExerciseId;
      readonly context: string;
    }
  | {
      /** An override whose steps are not all of the phase it replaces. */
      readonly kind: 'instruction-override-phase-mismatch';
      readonly exerciseId: ExerciseId;
      readonly replaces: MovementStepKind;
    }
  | {
      /**
       * A context that does not resolve to a complete instruction.
       *
       * Provable from phase replacement, and checked anyway: it is the
       * invariant §8 states, and a future change to the override model would
       * break it silently otherwise.
       */
      readonly kind: 'instruction-context-incomplete';
      readonly exerciseId: ExerciseId;
      readonly context: string;
      readonly missing: readonly MovementStepKind[];
    }
  | {
      /**
       * Instruction text stating how a prescribed number is counted.
       *
       * What a number means comes from the prescription (§8), and authored text
       * cannot know which counting a slot will use — so a step saying "then
       * switch sides" is either wrong or accidentally right. The check is
       * deliberately narrow: it catches counting phrasing, not anatomy, so
       * "step back with your other leg" stays legal.
       */
      readonly kind: 'instruction-states-counting';
      readonly exerciseId: ExerciseId;
      readonly text: string;
    };

/**
 * Things worth knowing about a matrix that is nonetheless valid.
 *
 * Advisories are not failures: they describe content gaps that are real product
 * signals rather than defects. A confirmed feature yielding no movements is
 * still a promise the product struggles to keep, and a pattern with only one
 * environment-independent option will produce repetitive substitute sessions.
 */
export type MatrixAdvisory =
  | {
      /**
       * A cited context reading prose authored for somewhere else.
       *
       * Legitimate — it is what stops every context duplicating an identical
       * action and return — but reported, so inheriting stays a decision
       * someone made rather than a context nobody thought about.
       */
      readonly kind: 'instruction-context-inherits-default';
      readonly exerciseId: ExerciseId;
      readonly featureId: string;
    }
  | { readonly kind: 'feature-without-movements'; readonly featureId: string }
  | { readonly kind: 'feature-with-single-movement'; readonly featureId: string }
  | {
      readonly kind: 'thin-environment-independent-pattern';
      readonly pattern: MovementPattern;
      readonly count: number;
    };

export type MatrixLoadResult =
  | {
      readonly ok: true;
      readonly matrix: ValidatedMatrix;
      readonly dropped: readonly DroppedEntry[];
      readonly advisories: readonly MatrixAdvisory[];
    }
  | { readonly ok: false; readonly failures: NonEmpty<MatrixValidationFailure> };

/** Validates authored matrix content. Generation never loads; loading is fallible. */
export type LoadMatrix = (authored: AuthoredMatrix) => MatrixLoadResult;

const asMatrix = (value: Omit<ValidatedMatrix, typeof matrixWitness>): ValidatedMatrix =>
  value as ValidatedMatrix;

const isPresentable = (a: ContentAuthority): a is PresentableAuthority => a.status !== 'draft';

/** project-content is weaker than reviewed; a mixed matrix reports the weaker tier. */
const weakestTier = (
  authorities: readonly PresentableAuthority[],
): PresentableAuthority['status'] =>
  authorities.some((a) => a.status === 'project-content') ? 'project-content' : 'reviewed';

export const loadMatrix: LoadMatrix = (authored: AuthoredMatrix) => {
  const failures: MatrixValidationFailure[] = [];
  const dropped: DroppedEntry[] = [];
  // Declared up here because instruction checks run before the failure gate and
  // can report an advisory. Advisories are discarded if the load fails, which
  // is correct: nothing loaded, so there is nothing to advise about.
  const advisories: MatrixAdvisory[] = [];

  const exerciseIds = new Set<string>();
  for (const exercise of authored.exercises) {
    if (exerciseIds.has(exercise.id)) failures.push({ kind: 'duplicate-id', id: exercise.id });
    exerciseIds.add(exercise.id);
    if (exercise.cues.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exercise.id} cues` });
    }
    // Authored content is untrusted here, so a field the type promises may
    // still be missing at runtime. Report that rather than throwing: a loader
    // that crashes on malformed content cannot report on malformed content.
    if (!Array.isArray(exercise.prescriptionKinds) || exercise.prescriptionKinds.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exercise.id} prescriptionKinds` });
    }
    // A movement with no acceptable counting can fill no slot that prescribes
    // one, which is a content defect rather than a very narrow movement.
    if (!Array.isArray(exercise.countingModes) || exercise.countingModes.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exercise.id} countingModes` });
    } else {
      for (const mode of exercise.countingModes) {
        if (mode !== 'total' && mode !== 'per-side') {
          failures.push({
            kind: 'malformed',
            detail: `exercise ${exercise.id} countingModes contains ${String(mode)}`,
          });
        }
      }
    }

  }

  const entryIds = new Set<string>();
  const compatibilities: UsableCompatibility[] = [];

  for (const entry of authored.compatibilities) {
    const at = `compatibility ${entry.id}`;
    if (entryIds.has(entry.id)) failures.push({ kind: 'duplicate-id', id: entry.id });
    entryIds.add(entry.id);

    if (!exerciseIds.has(entry.exerciseId)) {
      failures.push({ kind: 'unknown-exercise-id', found: entry.exerciseId, at });
    }
    // Class C objects are not SupportedFeatureIds, so an excluded reference
    // fails this check rather than needing a separate exclusion list.
    if (!isSupportedFeatureId(entry.featureId)) {
      failures.push({ kind: 'excluded-feature-referenced', found: entry.featureId, at });
    }
    if (!checkSources(entry.authority, entry.id, failures)) continue;

    if (!isPresentable(entry.authority)) {
      dropped.push({ id: entry.id, exerciseId: entry.exerciseId, reason: 'draft' });
      continue;
    }
    compatibilities.push(entry as UsableCompatibility);
  }

  const environmentIndependent: UsableEnvironmentIndependentMovement[] = [];

  for (const entry of authored.environmentIndependent) {
    const at = `environment-independent ${entry.id}`;
    if (entryIds.has(entry.id)) failures.push({ kind: 'duplicate-id', id: entry.id });
    entryIds.add(entry.id);

    if (!exerciseIds.has(entry.exerciseId)) {
      failures.push({ kind: 'unknown-exercise-id', found: entry.exerciseId, at });
    }
    if (!checkSources(entry.authority, entry.id, failures)) continue;

    if (!isPresentable(entry.authority)) {
      dropped.push({ id: entry.id, exerciseId: entry.exerciseId, reason: 'draft' });
      continue;
    }
    environmentIndependent.push(entry as UsableEnvironmentIndependentMovement);
  }

  // Instructions are checked here rather than with the other per-exercise
  // fields: a declared context has to be checked against the claims the matrix
  // actually holds, and those are not known until now.
  const eiFor = new Set(environmentIndependent.map((e) => String(e.exerciseId)));
  const featuresFor = new Map<string, Set<string>>();
  for (const c of compatibilities) {
    const key = String(c.exerciseId);
    const set = featuresFor.get(key) ?? new Set<string>();
    set.add(String(c.featureId));
    featuresFor.set(key, set);
  }
  for (const exercise of authored.exercises) {
    checkInstructions(
      exercise.id,
      exercise.instructions,
      eiFor.has(String(exercise.id)),
      featuresFor.get(String(exercise.id)) ?? new Set<string>(),
      failures,
      advisories,
    );
  }

  // An exercise reachable by no route is dead weight in a catalog whose whole
  // point is being small enough to read.
  const reachable = new Set<string>([
    ...compatibilities.map((c) => c.exerciseId),
    ...environmentIndependent.map((e) => e.exerciseId),
  ]);
  for (const exercise of authored.exercises) {
    if (!reachable.has(exercise.id)) {
      failures.push({ kind: 'orphan-exercise', exerciseId: exercise.id });
    }
  }

  // Every pattern the catalog claims must be obtainable somewhere, or the
  // pattern is a promise the matrix cannot keep.
  const byId = new Map(authored.exercises.map((e) => [e.id as string, e]));
  const reachablePatterns = new Set<MovementPattern>();
  for (const id of reachable) {
    const pattern = byId.get(id)?.pattern;
    if (pattern !== undefined) reachablePatterns.add(pattern);
  }
  for (const exercise of authored.exercises) {
    if (!reachablePatterns.has(exercise.pattern)) {
      failures.push({ kind: 'pattern-unreachable', pattern: exercise.pattern });
    }
  }

  if (compatibilities.length === 0) failures.push({ kind: 'empty-collection', at: 'compatibilities' });
  if (environmentIndependent.length === 0) {
    failures.push({ kind: 'empty-collection', at: 'environmentIndependent' });
  }

  const [first, ...rest] = failures;
  if (first !== undefined) return { ok: false, failures: [first, ...rest] };

  for (const feature of FEATURE_REGISTRY.supported) {
    const count = compatibilities.filter((c) => c.featureId === feature.id).length;
    if (count === 0) advisories.push({ kind: 'feature-without-movements', featureId: feature.id });
    else if (count === 1) advisories.push({ kind: 'feature-with-single-movement', featureId: feature.id });
  }

  // Counted over every pattern the catalog contains, not only those with an
  // environment-independent option, so a pattern with zero is reported rather
  // than absent from the tally.
  const eiByPattern = new Map<MovementPattern, number>();
  for (const exercise of authored.exercises) eiByPattern.set(exercise.pattern, 0);
  for (const entry of environmentIndependent) {
    const pattern = byId.get(entry.exerciseId)?.pattern;
    if (pattern !== undefined) eiByPattern.set(pattern, (eiByPattern.get(pattern) ?? 0) + 1);
  }
  for (const [pattern, count] of [...eiByPattern].sort()) {
    if (count < 2) advisories.push({ kind: 'thin-environment-independent-pattern', pattern, count });
  }

  const tiers = [
    ...compatibilities.map((c) => c.authority),
    ...environmentIndependent.map((e) => e.authority),
  ];

  return {
    ok: true,
    matrix: asMatrix({
      version: authored.version,
      authorityTier: weakestTier(tiers),
      exercises: authored.exercises,
      compatibilities,
      environmentIndependent,
    }),
    dropped,
    advisories,
  };
};

/**
 * Counting phrasing an instruction may not carry.
 *
 * Narrow on purpose. These are the ways text states what a prescribed number
 * means; anatomical references like "your other leg" describe the movement and
 * are untouched.
 */
const COUNTING_PHRASING = /\bper side\b|\bswitch sides\b|\beach side\b|\brepeat on the (other|opposite) side\b/i;

/**
 * Validates one movement's instruction state.
 *
 * `outstanding` needs nothing: it is the absence of a claim. The other two are
 * claims, and each has to hold up.
 */
const contextLabel = (c: { kind: string; featureId?: unknown }): string =>
  c.kind === 'confirmed-feature' ? `feature:${String(c.featureId)}` : 'environment-independent';

/** Steps must run setup* action* return*, so a phase is a contiguous run. */
const inPhaseOrder = (steps: readonly MovementStep[]): boolean => {
  let highest = -1;
  for (const step of steps) {
    const rank = PHASE_ORDER.indexOf(step.kind);
    if (rank < highest) return false;
    highest = Math.max(highest, rank);
  }
  return true;
};

/** Validates one ordered run of steps. Shared by the default and every override. */
const checkSteps = (
  exerciseId: ExerciseId,
  steps: readonly MovementStep[],
  failures: MatrixValidationFailure[],
): ReadonlySet<MovementStepKind> => {
  const kinds = new Set<MovementStepKind>();
  for (const step of steps) {
    if (step === null || typeof step !== 'object' || typeof step.text !== 'string') {
      failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} instruction step` });
      continue;
    }
    if (step.text.trim().length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exerciseId} instruction step text` });
    }
    if (!PHASE_ORDER.includes(step.kind)) {
      failures.push({
        kind: 'malformed',
        detail: `exercise ${exerciseId} instruction step kind ${String(step.kind)}`,
      });
      continue;
    }
    if (COUNTING_PHRASING.test(step.text)) {
      failures.push({ kind: 'instruction-states-counting', exerciseId, text: step.text });
    }
    kinds.add(step.kind);
  }
  return kinds;
};

/**
 * Validates one movement's instruction state against the claims the matrix holds.
 *
 * `outstanding` needs nothing: it is the absence of a claim. The other two are
 * claims, and each has to hold up.
 */
const checkInstructions = (
  exerciseId: ExerciseId,
  state: InstructionState,
  isEnvironmentIndependent: boolean,
  citedFeatures: ReadonlySet<string>,
  failures: MatrixValidationFailure[],
  advisories: MatrixAdvisory[],
): void => {
  // Authored content is untrusted at this boundary; a state the type promises
  // may still be missing or malformed at runtime.
  if (state === null || typeof state !== 'object' || !('kind' in state)) {
    failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} instructions` });
    return;
  }

  if (state.kind === 'outstanding') return;

  if (state.kind === 'not-required') {
    // A reason is what separates a decision from an omission.
    if (typeof state.reason !== 'string' || state.reason.trim().length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exerciseId} not-required reason` });
    }
    return;
  }

  if (state.kind !== 'authored') {
    failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} instructions kind` });
    return;
  }

  if (!Array.isArray(state.steps) || state.steps.length === 0) {
    failures.push({ kind: 'empty-collection', at: `exercise ${exerciseId} instruction steps` });
    return;
  }

  const defaultKinds = checkSteps(exerciseId, state.steps, failures);
  if (!inPhaseOrder(state.steps)) {
    failures.push({ kind: 'instruction-steps-out-of-phase-order', exerciseId });
  }

  const missing = (['setup', 'action'] as const).filter((k) => !defaultKinds.has(k));
  if (missing.length > 0) {
    failures.push({ kind: 'instruction-missing-required-step', exerciseId, missing });
  }

  checkSources(state.authority, String(exerciseId), failures);

  /* ------------------------------------------------------- default context */

  const declared = state.defaultContext;
  if (declared === null || typeof declared !== 'object' || !('kind' in declared)) {
    failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} defaultContext` });
    return;
  }

  if (declared.kind === 'environment-independent') {
    if (!isEnvironmentIndependent) {
      failures.push({
        kind: 'instruction-context-uncited',
        exerciseId,
        context: 'environment-independent',
      });
    }
  } else if (declared.kind === 'confirmed-feature') {
    if (!citedFeatures.has(String(declared.featureId))) {
      failures.push({
        kind: 'instruction-context-uncited',
        exerciseId,
        context: contextLabel(declared),
      });
    }
    // Where the movement can be performed with nothing, that is its baseline.
    if (isEnvironmentIndependent) {
      failures.push({ kind: 'instruction-default-context-not-baseline', exerciseId });
    }
  } else {
    failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} defaultContext kind` });
    return;
  }

  /* ------------------------------------------------------------ overrides */

  const overrides = state.overrides ?? [];
  if (!Array.isArray(overrides)) {
    failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} instruction overrides` });
    return;
  }

  const seen = new Set<string>();
  const overriddenBy = new Map<string, Set<MovementStepKind>>();

  for (const override of overrides) {
    if (override === null || typeof override !== 'object') {
      failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} instruction override` });
      continue;
    }
    const featureId = String(override.featureId);

    if (!isSupportedFeatureId(override.featureId)) {
      failures.push({ kind: 'excluded-feature-referenced', found: override.featureId, at: `exercise ${exerciseId} instruction override` });
      continue;
    }
    if (!citedFeatures.has(featureId)) {
      failures.push({ kind: 'instruction-context-uncited', exerciseId, context: `feature:${featureId}` });
      continue;
    }
    // An override for the default context, or a second one for the same phase,
    // can never be selected.
    const isDefaultContext =
      declared.kind === 'confirmed-feature' && String(declared.featureId) === featureId;
    const key = `${featureId}::${String(override.replaces)}`;
    if (isDefaultContext || seen.has(key)) {
      failures.push({ kind: 'instruction-override-unreachable', exerciseId, context: key });
      continue;
    }
    seen.add(key);

    if (!PHASE_ORDER.includes(override.replaces)) {
      failures.push({ kind: 'malformed', detail: `exercise ${exerciseId} override replaces ${String(override.replaces)}` });
      continue;
    }
    if (!Array.isArray(override.steps) || override.steps.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exerciseId} override steps` });
      continue;
    }
    const kinds = checkSteps(exerciseId, override.steps, failures);
    if (kinds.size !== 1 || !kinds.has(override.replaces)) {
      failures.push({ kind: 'instruction-override-phase-mismatch', exerciseId, replaces: override.replaces });
    }
    checkSources(override.authority, String(exerciseId), failures);

    const phases = overriddenBy.get(featureId) ?? new Set<MovementStepKind>();
    phases.add(override.replaces);
    overriddenBy.set(featureId, phases);
  }

  /* ------------------------------------------- every context resolves whole */

  for (const context of instructionContextsFor(isEnvironmentIndependent, [...citedFeatures].sort())) {
    const applied = context.kind === 'confirmed-feature' ? overriddenBy.get(context.featureId) : undefined;
    const resolved = new Set<MovementStepKind>(defaultKinds);
    for (const phase of applied ?? []) resolved.add(phase);

    const gaps = (['setup', 'action'] as const).filter((k) => !resolved.has(k));
    if (gaps.length > 0) {
      failures.push({
        kind: 'instruction-context-incomplete',
        exerciseId,
        context: contextLabel(context),
        missing: gaps,
      });
    }

    // Reading prose authored for elsewhere is legitimate and is reported.
    const isDefault =
      (context.kind === 'environment-independent' && declared.kind === 'environment-independent') ||
      (context.kind === 'confirmed-feature' &&
        declared.kind === 'confirmed-feature' &&
        String(declared.featureId) === context.featureId);
    if (!isDefault && context.kind === 'confirmed-feature' && applied === undefined) {
      advisories.push({
        kind: 'instruction-context-inherits-default',
        exerciseId,
        featureId: context.featureId,
      });
    }
  }
};

/** Project content and reviewed content both have to say what they rest on. */
const checkSources = (
  authority: ContentAuthority,
  id: string,
  failures: MatrixValidationFailure[],
): boolean => {
  if (authority.status === 'project-content' && authority.basisRefs.length === 0) {
    failures.push({ kind: 'unsourced-content', id });
    return false;
  }
  if (authority.status === 'reviewed' && authority.sourceRefs.length === 0) {
    failures.push({ kind: 'unsourced-content', id });
    return false;
  }
  return true;
};
