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
 * Where a step sits in the movement (§8).
 *
 * Typed rather than a flat list because the defect is predictable: the
 * commonest fault in an instruction is a missing start position, and a set of
 * steps that begins mid-movement reads as complete when it is not. Typing the
 * setup step lets the loader require one.
 */
export type MovementStepKind = 'setup' | 'action' | 'return';

/** One ordered step. Step N presumes the steps before it have been done. */
export interface MovementStep {
  readonly kind: MovementStepKind;
  readonly text: string;
}

/**
 * Whether a movement has written instructions, and why not when it does not (§8).
 *
 * Three states, deliberately distinct. "We decided none is needed" and "we have
 * not written one yet" are different facts about the content, and a model that
 * collapses them into absence loses the distinction permanently — the same
 * discipline §7 applies to venue features.
 *
 * `authored` carries `PresentableAuthority` rather than `ContentAuthority`, so
 * a draft instruction is unrepresentable. It has nowhere it needs to live:
 * `outstanding` already says "not ready", and admitting a draft here would let
 * half-written instructions sit in the catalog looking like content.
 *
 * Authority is the instruction's own, never the exercise's. Instructions are
 * separate content on a separate authoring schedule, and inheriting an
 * exercise's tier would let an instruction acquire authority it never earned.
 *
 * **Ordered instructions are not execution cues.** Cues are corrective and
 * unordered, addressed to someone already performing the movement; steps are
 * constructive and ordered, addressed to someone who has never performed it.
 * Neither replaces the other, and `cues` is untouched by any of this.
 *
 * **The resolution invariant.** The default completely constructs *its own
 * declared context*. Every supported generation context must **resolve** to a
 * complete instruction, from the default alone or through valid phase
 * overrides. The unmodified default is not required to be valid in every
 * context — requiring that would push the prose back toward describing nothing
 * in particular.
 *
 * Only `authored` resolves. `outstanding` and `not-required` are facts about a
 * movement, not about where it is performed; a movement authored for a bench
 * and outstanding for stairs would be a fourth state wearing a disguise.
 */
/**
 * Which basis an authored instruction's steps construct (§8).
 *
 * Declared, never inferred. Prose whose intended basis is unknown is prose
 * nobody can review: a reader cannot otherwise tell whether "place your whole
 * foot on the step" was written for a bench or for a stair.
 *
 * Deliberately the same shape as `SelectionBasis`, because that is what it is
 * resolved against — the context the generated item actually cited.
 */
export type InstructionContext =
  | { readonly kind: 'environment-independent' }
  | { readonly kind: 'confirmed-feature'; readonly featureId: SupportedFeatureId };

/**
 * One phase of a default instruction, rewritten for one other context.
 *
 * The unit is a phase, never a step and never a whole instruction. A whole
 * instruction would duplicate the action and the return, which are identical
 * across contexts, and two copies of a paragraph are two paragraphs that drift.
 * A step would need identities and make splicing ambiguous. A phase is the
 * smallest unit that is both meaningful and unambiguous to replace.
 *
 * Because a phase may only be replaced by a non-empty set of steps of the same
 * kind, a resolved instruction cannot lose the setup or the action its default
 * guaranteed.
 *
 * Its own authority, for the same reason the instruction has one: an override
 * added after a review would otherwise ride on the reviewed tier without having
 * been reviewed.
 */
export interface InstructionOverride {
  readonly featureId: SupportedFeatureId;
  /** Which phase this replaces. Every step must be of this kind. */
  readonly replaces: MovementStepKind;
  readonly steps: NonEmpty<MovementStep>;
  readonly authority: PresentableAuthority;
}

export type InstructionState =
  | {
      readonly kind: 'authored';
      /** The context `steps` completely constructs. */
      readonly defaultContext: InstructionContext;
      /** Ordered, and in phase order: every setup, then every action, then every return. */
      readonly steps: NonEmpty<MovementStep>;
      /**
       * Other cited contexts whose setup, action or return differs.
       *
       * Optional, unlike `instructions` itself. Absence here genuinely means
       * "the default covers every cited context", which carries no ambiguity —
       * unlike an absent instruction, where "none needed" and "not written" are
       * different facts.
       */
      readonly overrides?: readonly InstructionOverride[];
      readonly authority: PresentableAuthority;
    }
  | {
      /** Deliberately none. The reason is required: "obvious" is not one. */
      readonly kind: 'not-required';
      readonly reason: string;
    }
  | { readonly kind: 'outstanding' };

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
  /**
   * How a prescribed number may legitimately be counted for this movement.
   *
   * A fact about the movement, in the same way `prescriptionKinds` is. A split
   * squat accepts only `per-side`; a plank accepts only `total`; a step-up
   * accepts either, because alternating legs and completing one side then the
   * other are both real ways to perform it.
   *
   * **Not derivable from `laterality`.** Laterality carries two meanings that
   * come apart here: trained one side at a time (split squat) and limbs
   * alternate as part of the gait (walking). Both are `unilateral`, and only
   * the first accepts `per-side` — "walk two minutes per side" is not a thing
   * a person can do. So this is authored per movement and proved against
   * policy (§8), never inferred.
   */
  readonly countingModes: NonEmpty<RepCounting>;
  /** Plain execution cues shown to the user. Not safety assurance (§9). */
  readonly cues: NonEmpty<string>;
  /**
   * Ordered instructions for someone who has not done this movement before.
   *
   * Required, and three-valued, so every movement states which it is. An
   * optional field would make "not yet written" and "deliberately none"
   * indistinguishable from each other and from an authoring oversight.
   */
  readonly instructions: InstructionState;
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

