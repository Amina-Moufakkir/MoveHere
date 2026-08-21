/**
 * Deterministic session generation contracts.
 *
 * Canonical plan: §6 steps 4-6, §10, §11, §16 (Gates E, I, J), §18.
 *
 * Generation is a pure function of its input. The same input must always
 * produce the same output, so sessions can be compared across venues (Gate I)
 * and against venue-blind alternatives (Gate J). Purity and totality are
 * architectural obligations enforced by boundaries and tests, not by these
 * types: a conforming implementation could still read a clock or throw.
 */

import type { SupportedFeatureId } from './feature.ts';
import type { GenerationVenueView, VenueSnapshotId } from './confirmation.ts';
import type { ValidatedMatrix } from './matrix-loader.ts';
import type { UsableGoalPolicy } from './policy-loader.ts';
import type { GoalPolicyId, PolicyVersion } from './policy.ts';
import type { GenerationSeed } from './prng.ts';
import type {
  ExerciseId,
  Prescription,
  CompatibilityEntryId,
  EnvironmentIndependentDeclarationId,
  PresentableAuthority,
} from './exercise.ts';

export type { GenerationSeed } from './prng.ts';

/** A list that cannot be empty. Used where an empty value would be a defect. */
export type NonEmpty<T> = readonly [T, ...T[]];

/**
 * Session goal (§6 step 4).
 *
 * A combined or "mixed" goal is deliberately absent: its semantics are not
 * defined well enough to enter generation, and an underspecified goal would
 * make sessions harder to compare under Gates I and J.
 *
 * **Mobility is deferred and is not a goal here.** It remains a candidate
 * pending reviewed domain input on whether MoveHere should program it at all
 * and whether it fits this programming model (§6 step 4, §8). Listing it as a
 * goal while no policy exists for it would make every exhaustive-by-goal type
 * in the system claim coverage the content does not have. The mobility
 * *pattern* still exists in the exercise catalog; a pattern a session may
 * include is not a goal a user may request.
 */
export const SESSION_GOALS = ['strength', 'conditioning'] as const;

export type SessionGoal = (typeof SESSION_GOALS)[number];

declare const minutesWitness: unique symbol;
declare const estimateWitness: unique symbol;

/**
 * The fixed set of session durations (§6 step 4).
 *
 * Free-form durations are deliberately excluded for Phase 1: a fixed set keeps
 * sessions comparable across venues and goals, which Gates I and J depend on.
 * Changing this set is a product decision requiring a plan revision.
 */
export const SESSION_DURATIONS = [10, 20, 30, 45] as const;

/** The permitted durations as plain literals, for keying exhaustive records. */
export type SessionDuration = (typeof SESSION_DURATIONS)[number];

/** A duration the user may request. */
export type SessionMinutes = (typeof SESSION_DURATIONS)[number] & {
  readonly [minutesWitness]: true;
};

/** Validating factory. Returns null for any value outside the fixed set. */
export type MakeSessionMinutes = (value: number) => SessionMinutes | null;

/**
 * The only way to obtain a SessionMinutes.
 *
 * The assertion below is the one legitimate use of a cast on a branded domain
 * type: it is inside the owning constructor and runs only after validation.
 * Everywhere else, asserting a brand into existence is prohibited.
 */
export const makeSessionMinutes: MakeSessionMinutes = (value) =>
  (SESSION_DURATIONS as readonly number[]).includes(value)
    ? (value as SessionMinutes)
    : null;

/**
 * How long a generated session is expected to take.
 *
 * Deliberately a different type from SessionMinutes. A requested duration comes
 * from the fixed set; an estimate is whatever the session actually adds up to,
 * and 27 minutes is a legitimate estimate but not a legitimate request. The
 * relationship between the two — that an estimate should not exceed the time
 * the user has — is not expressible in a type and is a test obligation.
 */
export type EstimatedMinutes = number & { readonly [estimateWitness]: true };

export type MakeEstimatedMinutes = (value: number) => EstimatedMinutes | null;

/** Rejects negative, zero, non-integer, and non-finite estimates. */
export const makeEstimatedMinutes: MakeEstimatedMinutes = (value) =>
  Number.isInteger(value) && value > 0 ? (value as EstimatedMinutes) : null;

/** Outdoor conditions signals (§11). */
export type ConditionSignal =
  | 'precipitation'
  | 'freezing'
  | 'extreme-heat'
  | 'heat-index'
  | 'insufficient-daylight'
  | 'severe-weather';

/**
 * Result of the conditions gate (§6 step 5).
 *
 * `unavailable` means conditions could not be determined. It is never treated
 * as acceptable and never produces a park session; it follows the same
 * user-facing fallback path as adverse conditions. The two remain distinct in
 * provenance because "conditions are adverse" and "conditions are unknown" are
 * different facts, and collapsing them would corrupt the seasonality signal.
 *
 * Assessed before generation, not inside it, so generation stays pure and the
 * gate can be evaluated and logged independently.
 */
/**
 * Why conditions are adverse.
 *
 * `user-reported` carries no signal because none was collected: the person said
 * it was unsuitable outside and was not asked why. Recording a cause here would
 * be asserting something they never said. `measured` exists for a future
 * forecast integration, which does know why.
 */
export type AdverseConditions =
  | { readonly kind: 'user-reported' }
  | { readonly kind: 'measured'; readonly signals: NonEmpty<ConditionSignal> };

export type ConditionsAssessment =
  | { readonly kind: 'acceptable' }
  | { readonly kind: 'adverse'; readonly cause: AdverseConditions }
  | { readonly kind: 'unavailable' };

/**
 * Whether a session is being built with a venue or without one.
 *
 * A discriminated union rather than a nullable venue: "no venue" is a distinct
 * mode, not a missing value, and modelling it as null invites callers to
 * construct an empty view and wonder what it means.
 */
export type GenerationContext =
  | { readonly kind: 'venue-aware'; readonly venue: GenerationVenueView }
  | { readonly kind: 'environment-independent' };

/** Why park use was withheld. Adverse and unavailable stay distinct (§11). */
export type WithheldCause =
  | { readonly kind: 'adverse'; readonly cause: AdverseConditions }
  | { readonly kind: 'unavailable' };

/**
 * The gate decision, made before generation.
 *
 * Generation obeys a disposition rather than interpreting an assessment, so the
 * gate can be evaluated and logged independently and generation stays pure.
 */
export type ConditionsDisposition =
  | { readonly kind: 'park-permitted' }
  | { readonly kind: 'park-withheld'; readonly cause: WithheldCause };

/**
 * Maps the user-reported assessment to a disposition (§6 step 5).
 *
 * `unavailable` is never treated as acceptable: it withholds park use exactly
 * as adverse conditions do, while staying distinguishable in provenance.
 */
export const assessConditions = (assessment: ConditionsAssessment): ConditionsDisposition => {
  if (assessment.kind === 'acceptable') return { kind: 'park-permitted' };
  if (assessment.kind === 'adverse') {
    return { kind: 'park-withheld', cause: { kind: 'adverse', cause: assessment.cause } };
  }
  return { kind: 'park-withheld', cause: { kind: 'unavailable' } };
};

/**
 * Everything generation is allowed to see.
 *
 * There is deliberately no field for pain, injury, medical condition, or
 * volunteered health free text. The optional health question in §10 is a
 * disclosure and a referral; its answer does not reach this type. Adding such a
 * field would make MoveHere a medical-programming system by accident
 * (CLAUDE.md invariant 5).
 */
export interface SessionGenerationInput {
  readonly context: GenerationContext;
  /** Carries its own goal, so input and policy cannot disagree (§8). */
  readonly policy: UsableGoalPolicy;
  /** Sole owner of the matrix version. */
  readonly matrix: ValidatedMatrix;
  readonly availableMinutes: SessionMinutes;
  readonly conditions: ConditionsDisposition;
  /** Makes any variation reproducible. Same seed and inputs, same session. */
  readonly seed: GenerationSeed;
}

/**
 * The reviewed authority a selection relied on.
 *
 * Captured at generation time so the decision stays auditable after the matrix
 * changes. Without the version and review date, a later reader can only
 * re-derive the selection against a matrix that may no longer match.
 */
export interface SelectionAuthority {
  readonly matrixVersion: string;
  /** Which tier authored the claim. Drives the session's provenance label (§8). */
  readonly tier: PresentableAuthority['status'];
  /** When that authority was established — authored or reviewed, per tier. */
  readonly attestedAt: string;
}

/**
 * Why a given item is permitted to appear in a session.
 *
 * Every item must cite one of exactly two justifications (§6 step 6), and must
 * name the specific claim relied on — not merely the feature involved. This
 * makes the invariant auditable in data rather than only in code, and makes the
 * substitution rate in §18 directly measurable.
 */
export type SelectionBasis =
  | {
      readonly kind: 'confirmed-feature';
      readonly featureId: SupportedFeatureId;
      readonly compatibilityId: CompatibilityEntryId;
      readonly authority: SelectionAuthority;
    }
  | {
      readonly kind: 'environment-independent';
      readonly declarationId: EnvironmentIndependentDeclarationId;
      readonly authority: SelectionAuthority;
    };

export interface SessionItem {
  readonly exerciseId: ExerciseId;
  readonly prescription: Prescription;
  readonly basis: SelectionBasis;
  readonly variationLabel?: string;
}

export interface SessionBlock {
  readonly name: string;
  readonly items: NonEmpty<SessionItem>;
}

/** Provenance carried by every generated session, so any session can be reproduced. */
export interface GenerationProvenance {
  readonly generatorVersion: string;
  readonly matrixVersion: string;
  readonly policyId: GoalPolicyId;
  readonly policyVersion: PolicyVersion;
  /**
   * Which authority tier produced this session's programming.
   *
   * Drives the persistent, quiet provenance label (§8). A session built from
   * project content must say so.
   */
  readonly authorityTier: PresentableAuthority['status'];
  /** Provenance and debugging only. Never surfaced as a user-facing control. */
  readonly seed: GenerationSeed;
  /** Which feature set was used, or null when generated without a venue. */
  readonly venueSnapshotId: VenueSnapshotId | null;
}

/**
 * Why a substitute session was offered instead of a park session (§11).
 *
 * Adverse and unavailable conditions are separate variants so provenance can
 * distinguish them.
 */
export type SubstituteReason =
  | { readonly kind: 'conditions-adverse'; readonly cause: AdverseConditions }
  | { readonly kind: 'conditions-unavailable' }
  | { readonly kind: 'no-confirmed-inventory' }
  | { readonly kind: 'no-compatible-venue-movements' };

/**
 * The result of generation.
 *
 * A park session and a substitute session are different kinds, not one kind
 * with a flag, because §11 requires the substitute be labeled as a substitute
 * and never presented as a park session.
 *
 * `not-generated` is reserved for cases where no valid session can be
 * constructed by any route. A venue that fails to resolve yields a substitute,
 * not nothing: a user who asked for a workout should not receive silence
 * because their park did not cooperate.
 */
export type SessionGenerationOutput =
  | {
      readonly kind: 'park-session';
      readonly blocks: NonEmpty<SessionBlock>;
      readonly estimatedMinutes: EstimatedMinutes;
      /** Non-empty by construction: a park session that used no feature is a substitute. */
      readonly featuresUsed: NonEmpty<SupportedFeatureId>;
      readonly provenance: GenerationProvenance;
    }
  | {
      readonly kind: 'substitute-session';
      readonly reason: SubstituteReason;
      readonly blocks: NonEmpty<SessionBlock>;
      readonly estimatedMinutes: EstimatedMinutes;
      readonly provenance: GenerationProvenance;
    }
  | {
      readonly kind: 'not-generated';
      readonly reason: 'insufficient-time' | 'no-movements-available';
    };

/**
 * The generator.
 *
 * Required to be pure and total: no clock, no randomness outside the seed, no
 * I/O, no network, no throwing. TypeScript proves none of that — see the module
 * comment. Every substitute session must be surfaced to the user as a
 * substitute.
 */
export type GenerateSession = (input: SessionGenerationInput) => SessionGenerationOutput;
