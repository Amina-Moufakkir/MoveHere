/**
 * Matrix × policy feasibility (§8).
 *
 * Runs before policy can enter production generation, and is enforced in
 * `npm run verify`. Its job is to turn "the user received no session" into a
 * build failure: a required slot that nothing can fill is a content defect,
 * not a runtime outcome.
 *
 * The governing rule: a required slot must be satisfiable from the
 * environment-independent pool alone, in both contexts, because a venue's
 * contents are unknown when content is loaded.
 */

import type { ValidatedMatrix } from './matrix-loader.ts';
import type { ValidatedPolicySet, UsableGoalPolicy } from './policy-loader.ts';
import { GENERATION_CONTEXTS } from './policy-loader.ts';
import type { GenerationContextKind, SlotTemplate } from './policy.ts';
import type { Exercise, ExerciseId, MovementPattern } from './exercise.ts';
import type { SessionGoal, SessionDuration } from './session.ts';
import { SESSION_DURATIONS } from './session.ts';
import { canFill, canFillIgnoringCounting } from './slot-eligibility.ts';

type NonEmpty<T> = readonly [T, ...T[]];

export interface FeasibilityLocation {
  readonly goal: SessionGoal;
  readonly duration: SessionDuration;
  readonly context: GenerationContextKind;
  readonly slotId: string;
}

/** The share of the requested duration a session must actually fill. */
export const MINIMUM_FILL_RATIO = 0.6;

export type FeasibilityError =
  | { readonly kind: 'required-slot-unsatisfiable'; readonly at: FeasibilityLocation; readonly patterns: readonly MovementPattern[]; readonly prescriptionKind: string }
  | { readonly kind: 'program-exceeds-duration'; readonly goal: SessionGoal; readonly duration: SessionDuration; readonly estimatedSeconds: number }
  | {
      /**
       * More required slots than distinct movements to fill them.
       *
       * Per-slot satisfiability is not enough: slots that forbid repeats
       * compete for the same pool, so N required slots drawing on the same
       * patterns need N distinct movements between them.
       */
      readonly kind: 'required-slots-exceed-distinct-movements';
      readonly goal: SessionGoal;
      readonly duration: SessionDuration;
      readonly context: GenerationContextKind;
      readonly unmatchedSlotIds: readonly string[];
    }
  | {
      /**
       * The worst-case session — required slots only, every optional
       * venue-dependent slot skipped — is too short for the time the user
       * asked for. This is what a substitute session looks like at a venue
       * with nothing confirmed, and it must still be worth doing.
       */
      readonly kind: 'substitute-underfills-duration';
      readonly goal: SessionGoal;
      readonly duration: SessionDuration;
      readonly estimatedSeconds: number;
      readonly fillRatio: number;
    };

export type FeasibilityAdvisory =
  | { readonly kind: 'program-underfills-duration'; readonly goal: SessionGoal; readonly duration: SessionDuration; readonly estimatedSeconds: number; readonly fillRatio: number }
  | { readonly kind: 'optional-slot-never-satisfiable'; readonly at: FeasibilityLocation }
  | { readonly kind: 'exercise-unreachable-by-policy'; readonly exerciseId: ExerciseId }
  | {
      /**
       * Counting reduced this slot to a single possible movement.
       *
       * Not a defect: a slot prescribing `per-side` should not be fillable by
       * a movement with no sides. It is reported because narrowing is how a
       * structurally correct slot becomes a slot that always produces the same
       * exercise, and that is a variety loss worth seeing rather than
       * discovering in a session.
       *
       * Only raised where counting is the cause — a slot that was already
       * single-option on pattern and dose alone is not this.
       */
      readonly kind: 'counting-narrows-slot-to-one';
      readonly at: FeasibilityLocation;
      readonly counting: string;
      readonly excluded: readonly ExerciseId[];
    }
  | { readonly kind: 'venue-features-do-not-differentiate'; readonly goal: SessionGoal; readonly duration: SessionDuration };

declare const feasibleWitness: unique symbol;

/**
 * Matrix and policy, checked against each other.
 *
 * Obtaining one is the precondition for selecting a policy for generation, so
 * feasibility cannot be forgotten.
 */
export interface FeasibleProgramming {
  readonly [feasibleWitness]: true;
  readonly matrix: ValidatedMatrix;
  readonly policies: ValidatedPolicySet;
}

export type FeasibilityResult =
  | {
      readonly ok: true;
      readonly programming: FeasibleProgramming;
      readonly advisories: readonly FeasibilityAdvisory[];
    }
  | { readonly ok: false; readonly errors: NonEmpty<FeasibilityError>; readonly advisories: readonly FeasibilityAdvisory[] };

export type CheckFeasibility = (
  matrix: ValidatedMatrix,
  policies: ValidatedPolicySet,
) => FeasibilityResult;

/** Selecting a policy requires proven feasibility. Total: exhaustive by type. */
export type SelectPolicy = (
  programming: FeasibleProgramming,
  goal: SessionGoal,
) => UsableGoalPolicy;

export const selectPolicy: SelectPolicy = (programming, goal) =>
  programming.policies.byGoal[goal];


/**
 * Estimated seconds for the slots that survive `keep`.
 *
 * Blocks that lose every slot drop out entirely, and rest is counted over what
 * remains — otherwise a skipped optional slot would still be charged rest.
 */
const programSeconds = (
  policy: UsableGoalPolicy,
  duration: SessionDuration,
  keep: (slot: SlotTemplate) => boolean = () => true,
): number => {
  const program = policy.programs[duration];
  const blocks = program.blocks
    .map((b) => b.slots.filter(keep))
    .filter((slots) => slots.length > 0);
  const work = blocks
    .map(
      (slots) =>
        slots.reduce((sum, s) => sum + s.estimatedSeconds, 0) +
        program.restBetweenItemsSeconds * (slots.length - 1),
    )
    .reduce((a, b) => a + b, 0);
  return work + program.restBetweenBlocksSeconds * (blocks.length - 1);
};

/**
 * Kuhn's algorithm. Returns the slots left unmatched when every slot is
 * assigned a distinct movement it can actually use.
 */
const unmatchedSlots = (
  slots: readonly SlotTemplate[],
  exercises: readonly Exercise[],
): readonly string[] => {
  const assignment = new Map<string, string>(); // exerciseId -> slotId
  const unmatched: string[] = [];

  const tryAssign = (slot: SlotTemplate, visited: Set<string>): boolean => {
    for (const exercise of exercises) {
      if (!canFill(exercise, slot) || visited.has(exercise.id)) continue;
      visited.add(exercise.id);
      const holder = assignment.get(exercise.id);
      const holderSlot = holder === undefined ? undefined : slots.find((s) => s.id === holder);
      if (holder === undefined || (holderSlot !== undefined && tryAssign(holderSlot, visited))) {
        assignment.set(exercise.id, slot.id);
        return true;
      }
    }
    return false;
  };

  // Sorted so the report is stable regardless of authoring order.
  for (const slot of [...slots].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    if (!tryAssign(slot, new Set())) unmatched.push(slot.id);
  }
  return unmatched;
};

const asProgramming = (value: Omit<FeasibleProgramming, typeof feasibleWitness>): FeasibleProgramming =>
  value as FeasibleProgramming;

export const checkFeasibility: CheckFeasibility = (matrix, policies) => {
  const errors: FeasibilityError[] = [];
  const advisories: FeasibilityAdvisory[] = [];

  const byId = new Map(matrix.exercises.map((e) => [e.id as string, e]));
  const eiExercises = matrix.environmentIndependent
    .map((e) => byId.get(e.exerciseId))
    .filter((e): e is Exercise => e !== undefined);
  const venueExercises = matrix.compatibilities
    .map((c) => byId.get(c.exerciseId))
    .filter((e): e is Exercise => e !== undefined);
  const allExercises = [...eiExercises, ...venueExercises];

  const usedExerciseIds = new Set<string>();

  for (const goal of Object.keys(policies.byGoal) as readonly SessionGoal[]) {
    const policy = policies.byGoal[goal];

    for (const duration of SESSION_DURATIONS) {
      const program = policy.programs[duration];
      const slots = program.blocks.flatMap((b) => [...b.slots]);

      for (const slot of slots) {
        for (const exercise of allExercises) {
          if (canFill(exercise, slot)) usedExerciseIds.add(exercise.id);
        }

        // Attribute a single-option slot to counting only when counting is
        // what caused it, so a slot with one movement to begin with is not
        // reported as though the constraint had narrowed it.
        const eligible = allExercises.filter((e) => canFill(e, slot));
        const eligibleIgnoringCounting = allExercises.filter((e) =>
          canFillIgnoringCounting(e, slot),
        );
        if (eligible.length < 2 && eligibleIgnoringCounting.length >= 2) {
          const keep = new Set(eligible.map((e) => e.id as string));
          advisories.push({
            kind: 'counting-narrows-slot-to-one',
            at: { goal, duration, context: 'venue-aware', slotId: slot.id },
            counting: 'counting' in slot.prescription ? slot.prescription.counting : 'n/a',
            excluded: [
              ...new Set(
                eligibleIgnoringCounting
                  .filter((e) => !keep.has(e.id as string))
                  .map((e) => e.id),
              ),
            ].sort(),
          });
        }

        for (const context of GENERATION_CONTEXTS) {
          const at: FeasibilityLocation = { goal, duration, context, slotId: slot.id };

          // Both contexts check against the environment-independent pool: a
          // venue-aware session may still be at a park with none of the
          // features this slot would prefer.
          const satisfiable = eiExercises.some((e) => canFill(e, slot));

          if (slot.obligation[context] === 'required' && !satisfiable) {
            errors.push({
              kind: 'required-slot-unsatisfiable',
              at,
              patterns: slot.eligiblePatterns,
              prescriptionKind: slot.prescription.kind,
            });
          }
          if (
            slot.obligation[context] === 'optional' &&
            !satisfiable &&
            !allExercises.some((e) => canFill(e, slot))
          ) {
            advisories.push({ kind: 'optional-slot-never-satisfiable', at });
          }
        }
      }

      // Maximum bipartite matching between no-repeat required slots and the
      // distinct environment-independent movements able to fill them.
      for (const context of GENERATION_CONTEXTS) {
        const competing = slots.filter(
          (s) => s.obligation[context] === 'required' && !s.allowRepeatExercise,
        );
        const unmatched = unmatchedSlots(competing, eiExercises);
        if (unmatched.length > 0) {
          errors.push({
            kind: 'required-slots-exceed-distinct-movements',
            goal,
            duration,
            context,
            unmatchedSlotIds: unmatched,
          });
        }
      }

      const estimated = programSeconds(policy, duration);
      const budget = duration * 60;
      if (estimated > budget) {
        errors.push({ kind: 'program-exceeds-duration', goal, duration, estimatedSeconds: estimated });
      } else if (estimated / budget < MINIMUM_FILL_RATIO) {
        advisories.push({
          kind: 'program-underfills-duration',
          goal,
          duration,
          estimatedSeconds: estimated,
          fillRatio: Math.round((estimated / budget) * 100) / 100,
        });
      }

      // The substitute worst case: required slots only, every optional
      // venue-dependent slot skipped. A user who asked for 45 minutes and has
      // nothing confirmed should not receive 19 minutes of work.
      const substituteSeconds = programSeconds(
        policy,
        duration,
        (slot) => slot.obligation.substitute === 'required',
      );
      if (substituteSeconds / budget < MINIMUM_FILL_RATIO) {
        errors.push({
          kind: 'substitute-underfills-duration',
          goal,
          duration,
          estimatedSeconds: substituteSeconds,
          fillRatio: Math.round((substituteSeconds / budget) * 1000) / 1000,
        });
      }

      // If no slot in a program can ever be filled by a venue movement, a
      // confirmed feature cannot change this session — a Gate I failure
      // visible at build time rather than after a park audit.
      const venueCanChange = slots.some((slot) =>
        venueExercises.some(
          (e) => canFill(e, slot) && !eiExercises.some((ei) => ei.id === e.id),
        ),
      );
      if (!venueCanChange) {
        advisories.push({ kind: 'venue-features-do-not-differentiate', goal, duration });
      }
    }
  }

  for (const exercise of matrix.exercises) {
    if (!usedExerciseIds.has(exercise.id)) {
      advisories.push({ kind: 'exercise-unreachable-by-policy', exerciseId: exercise.id });
    }
  }

  const [first, ...rest] = errors;
  if (first !== undefined) return { ok: false, errors: [first, ...rest], advisories };

  return { ok: true, programming: asProgramming({ matrix, policies }), advisories };
};
