/**
 * Goal programming policy contracts (§8).
 *
 * Policy is fitness judgment expressed as data. The generator executes it and
 * contains no programming knowledge of its own.
 *
 * The MVP schema is deliberately narrow. Prescriptions are exact rather than
 * ranges, blocks carry a display name rather than a role from a taxonomy, and
 * rest is two plain numbers. That keeps §8's unresolved domain questions —
 * block roles, work/rest structures, range resolution — genuinely unanswered
 * rather than answered by accident.
 */

import type { MovementPattern, Prescription, ContentAuthority } from './exercise.ts';
import type { SessionGoal, SessionDuration } from './session.ts';

export type GoalPolicyId = string & { readonly __brand: 'GoalPolicyId' };
export type PolicyVersion = string & { readonly __brand: 'PolicyVersion' };
export type SlotId = string & { readonly __brand: 'SlotId' };

type NonEmpty<T> = readonly [T, ...T[]];

/** Which pool a session is being built from. */
export type GenerationContextKind = 'venue-aware' | 'substitute';

/**
 * What a slot owes in a given context.
 *
 * `required` means the program is unfillable without it, which forces a
 * fallback. `optional` means fill it when something is eligible and skip it
 * otherwise.
 */
export type SlotObligation = 'required' | 'optional';

/**
 * Whether a venue movement is preferred when both kinds are eligible.
 *
 * `prefer-venue-feature` is what makes a confirmed feature change the session
 * at all. It is a preference among *already eligible* movements: it may never
 * force an incompatible movement into a slot merely to make venue awareness
 * visible.
 */
export type SourcePreference = 'prefer-venue-feature' | 'no-preference';

/**
 * One way a slot may be dosed (§8).
 *
 * A slot whose legitimately eligible movements need different prescription
 * shapes carries several of these. A side plank is held per side and a plank
 * is not; both belong in a core hold, and one prescription cannot serve them
 * without lying about one of them.
 *
 * `estimatedSeconds` lives here rather than on the slot because dosing decides
 * duration: a per-side hold is twice the work of a total hold at the same
 * seconds. Counting, dose, and time stay one authored decision — they have
 * simply moved down one level together.
 *
 * A variant describes a prescription shape. It may never name an exercise:
 * that would turn slot structure into the specific-exercise mandate §8 records
 * as an unresolved domain question.
 */
export interface PrescriptionVariant {
  readonly prescription: Prescription;
  /**
   * How long this dosing is expected to take, including its own working rest.
   *
   * Authored, not computed. How long a set takes is a programming judgment, so
   * the policy owns the time model rather than the mechanism inferring one.
   */
  readonly estimatedSeconds: number;
}

/**
 * One training purpose, one set of semantics, one or more ways to dose it.
 *
 * Everything that makes this one slot is single-valued: the patterns it draws
 * from, what it owes in each context, whether it prefers a venue movement, and
 * whether a movement may repeat. Only the dosing varies.
 *
 * **`variants` is ordered, and the order is authored precedence.** A movement
 * is selected first; it then takes the first variant it is compatible with.
 * Reordering variants is a policy change, not a permutation of a collection —
 * generation output is invariant under permutation of *matrix* collections,
 * whose order carries no meaning, and deliberately is not invariant here.
 */
export interface SlotTemplate {
  readonly id: SlotId;
  readonly eligiblePatterns: NonEmpty<MovementPattern>;
  readonly variants: NonEmpty<PrescriptionVariant>;
  readonly obligation: Record<GenerationContextKind, SlotObligation>;
  readonly sourcePreference: SourcePreference;
  readonly allowRepeatExercise: boolean;
}

export interface BlockTemplate {
  /** Display name only. No role taxonomy is asserted (§8). */
  readonly name: string;
  readonly slots: NonEmpty<SlotTemplate>;
}

export interface DurationProgram {
  readonly blocks: NonEmpty<BlockTemplate>;
  readonly restBetweenItemsSeconds: number;
  readonly restBetweenBlocksSeconds: number;
}

/** Mapped over the closed duration set: a missing duration is a compile error. */
export type DurationPrograms = { readonly [D in SessionDuration]: DurationProgram };

export interface AuthoredGoalPolicy {
  readonly id: GoalPolicyId;
  readonly goal: SessionGoal;
  readonly version: PolicyVersion;
  readonly authority: ContentAuthority;
  readonly programs: DurationPrograms;
}
