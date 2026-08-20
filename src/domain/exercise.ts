/**
 * Exercises and the feature-to-movement compatibility matrix.
 *
 * Canonical plan: §8 (Exercise Compatibility Engine), §9, §10.
 *
 * An Exercise describes a movement and knows nothing about environments.
 * What can be performed where is stated once, in ExerciseCompatibility and
 * EnvironmentIndependentMovement, so there is a single answer to that question.
 */

import type { SupportedFeatureId } from './feature';

export type ExerciseId = string & { readonly __brand: 'ExerciseId' };

/**
 * Stable identity for one compatibility claim.
 *
 * Stable across matrix versions: it identifies the claim, not the revision of
 * it. A generated session cites this id so the decision remains auditable after
 * the matrix changes (§8).
 */
export type CompatibilityEntryId = string & { readonly __brand: 'CompatibilityEntryId' };

/** Stable identity for one environment-independence declaration. */
export type EnvironmentIndependentDeclarationId = string & {
  readonly __brand: 'EnvironmentIndependentDeclarationId';
};

/** Coverage categories used to balance a session. Not a training methodology claim. */
export type MovementPattern =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'core'
  | 'locomotion'
  | 'mobility';

/** How a movement is dosed. Kept explicit so generated sessions are executable as written. */
export type Prescription =
  | { readonly kind: 'reps'; readonly sets: number; readonly reps: number }
  | { readonly kind: 'time'; readonly sets: number; readonly seconds: number }
  | { readonly kind: 'distance'; readonly meters: number };

/**
 * A movement definition.
 *
 * Carries no injury, condition, or contraindication metadata. MoveHere does not
 * do injury-aware programming, and adding such a field here would be the first
 * step toward doing it accidentally (§10, CLAUDE.md invariant 5).
 */
export interface Exercise {
  readonly id: ExerciseId;
  readonly name: string;
  readonly pattern: MovementPattern;
  /** Plain execution cues shown to the user. Not safety assurance (§9). */
  readonly cues: readonly string[];
  readonly defaultPrescription: Prescription;
}

/**
 * Review state for a compatibility claim.
 *
 * §8 requires the exercise set be reviewed before it is treated as
 * authoritative. Generation must consider `reviewed` entries only; `draft`
 * entries exist so unreviewed work is visible rather than silently live.
 */
export type CompatibilityReview =
  | { readonly status: 'draft'; readonly note?: string }
  | {
      readonly status: 'reviewed';
      /** Required on reviewed claims. A review without a date cannot be audited. */
      readonly reviewedAt: string;
      readonly note?: string;
    };

/**
 * One reviewed claim: this exercise can be performed using this feature.
 *
 * The claim is about compatibility, not safety. It must not depend on load
 * ratings, fixings, or condition of any specific real structure — assumptions
 * MoveHere has no authority to make (§9). If an exercise only works on a
 * feature under such an assumption, it does not belong in the matrix.
 */
export interface ExerciseCompatibility {
  readonly id: CompatibilityEntryId;
  readonly exerciseId: ExerciseId;
  readonly featureId: SupportedFeatureId;
  /** Names the feature-specific variation, e.g. bench step-up vs. stair step-up. */
  readonly variationLabel?: string;
  readonly prescriptionOverride?: Prescription;
  readonly review: CompatibilityReview;
}

/**
 * A movement requiring no venue feature at all.
 *
 * These are the only movements available before any scan (§6 step 1) and the
 * entire vocabulary of the adverse-conditions substitute session (§11).
 * Membership is an explicit declaration, never an inference from an empty
 * compatibility list.
 */
export interface EnvironmentIndependentMovement {
  readonly id: EnvironmentIndependentDeclarationId;
  readonly exerciseId: ExerciseId;
  readonly environmentIndependent: true;
  /** What the movement does assume — flat ground to stand on, and nothing else. */
  readonly assumes: 'nothing-beyond-standing-space';
  readonly review: CompatibilityReview;
}

/** The compatibility engine's data, versioned so generated sessions are reproducible. */
export interface CompatibilityMatrix {
  readonly version: string;
  readonly exercises: readonly Exercise[];
  readonly compatibility: readonly ExerciseCompatibility[];
  readonly environmentIndependent: readonly EnvironmentIndependentMovement[];
}
