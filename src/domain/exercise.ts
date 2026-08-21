/**
 * Exercises and the feature-to-movement compatibility matrix.
 *
 * Canonical plan: §8 (Exercise Compatibility Engine), §9, §10.
 *
 * An Exercise describes a movement and knows nothing about environments or
 * programming. What can be performed where is stated once, in
 * ExerciseCompatibility and EnvironmentIndependentMovement. How much of it to
 * do is not stated here at all — that is goal programming policy's job.
 */

import type { SupportedFeatureId } from './feature.ts';

export type ExerciseId = string & { readonly __brand: 'ExerciseId' };
export type MatrixVersion = string & { readonly __brand: 'MatrixVersion' };

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

/**
 * Whether a movement works one side at a time.
 *
 * A property of the movement, not a policy choice: a split squat is unilateral
 * regardless of who programs it. How a prescribed number is counted for a
 * unilateral movement is separate, and belongs to the prescription (§15).
 */
export type Laterality = 'bilateral' | 'unilateral';

/** How a movement can legitimately be dosed. A fact about the movement. */
export type PrescriptionKind = 'reps' | 'time' | 'distance';

/** How a movement is dosed in a generated session. Values come from policy. */
export type Prescription =
  | { readonly kind: 'reps'; readonly sets: number; readonly reps: number; readonly counting: RepCounting }
  | { readonly kind: 'time'; readonly sets: number; readonly seconds: number; readonly counting: RepCounting }
  | { readonly kind: 'distance'; readonly meters: number };

/** Whether a prescribed number applies per side or to both together (§15). */
export type RepCounting = 'total' | 'per-side';

/**
 * Content authority (§8).
 *
 * Three tiers. `draft` never reaches generation. `project-content` is authored
 * from researched general-fitness conventions for the school/portfolio MVP: it
 * is presentable and must be labeled, but it is not professional review and
 * never becomes reviewed by being used. `reviewed` is professional sign-off.
 *
 * No tier authorizes medical, rehabilitation, diagnostic, or injury-specific
 * content — see §10.
 */
export type ContentAuthority =
  | { readonly status: 'draft'; readonly note?: string }
  | {
      readonly status: 'project-content';
      readonly authoredAt: string;
      /** What the content is based on. Non-empty: unsourced content is opinion. */
      readonly basisRefs: NonEmpty<string>;
      readonly note?: string;
    }
  | {
      readonly status: 'reviewed';
      readonly reviewedAt: string;
      readonly reviewerRef: string;
      readonly credentialRef: string;
      readonly sourceRefs: NonEmpty<string>;
      /** Single-member union, deliberately: §10's boundary is unrepresentable. */
      readonly scope: 'general-fitness';
      readonly note?: string;
    };

/** Authority tiers that may reach a user. Draft is structurally excluded. */
export type PresentableAuthority = Extract<
  ContentAuthority,
  { status: 'project-content' } | { status: 'reviewed' }
>;

type NonEmpty<T> = readonly [T, ...T[]];

/**
 * A movement definition.
 *
 * Carries no injury, condition, or contraindication metadata (§10), and no
 * prescription values: how much to do is programming judgment and lives in
 * policy, not in the catalog.
 */
export interface Exercise {
  readonly id: ExerciseId;
  readonly name: string;
  readonly pattern: MovementPattern;
  readonly laterality: Laterality;
  /** Ways this movement can be dosed. Policy may not prescribe reps for a hold. */
  readonly prescriptionKinds: NonEmpty<PrescriptionKind>;
  /** Plain execution cues shown to the user. Not safety assurance (§9). */
  readonly cues: NonEmpty<string>;
}

/**
 * One claim: this exercise can be performed using this feature.
 *
 * The claim is about compatibility, not safety. It must not depend on load
 * ratings, fixings, or the condition of any specific real structure —
 * assumptions MoveHere has no authority to make (§9). If an exercise only works
 * on a feature under such an assumption, it does not belong in the matrix.
 */
export interface ExerciseCompatibility {
  readonly id: CompatibilityEntryId;
  readonly exerciseId: ExerciseId;
  readonly featureId: SupportedFeatureId;
  /** Names the feature-specific variation, e.g. bench step-up vs. stair step-up. */
  readonly variationLabel?: string;
  readonly authority: ContentAuthority;
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
  readonly authority: ContentAuthority;
}

/** Authored matrix content, before validation. May contain draft entries. */
export interface AuthoredMatrix {
  readonly version: MatrixVersion;
  readonly exercises: readonly Exercise[];
  readonly compatibilities: readonly ExerciseCompatibility[];
  readonly environmentIndependent: readonly EnvironmentIndependentMovement[];
}

