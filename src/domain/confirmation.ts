/**
 * The single path from observation to authoritative venue state.
 *
 * Canonical plan: §6 steps 2-3 and 7, §7, §13, §14.
 *
 *     candidate  ->  confirmation  ->  confirmed inventory  ->  generation view
 *
 * Manual feature selection and any future vision detection are both sources of
 * candidates and nothing more. Neither writes confirmed state directly, and
 * vision does not get a second route into generation (CLAUDE.md invariant 3).
 *
 * Every branded type in this module exists to make one thing impossible:
 * fabricating venue state that no user confirmed. Brands protect collections as
 * well as containers, because object spread copies a container's brand and the
 * natural way to "update" an inventory is to spread it.
 *
 * What the brands stop: object literals, update-by-spread, structural clones
 * from other modules, and untrusted persisted state.
 *
 * What they cannot stop: a deliberate type assertion. `x as ConfirmedVenueInventory`
 * and `x as unknown as T` defeat any brand, in any type system TypeScript has.
 * Constructing a branded domain value by assertion, and calling JSON.parse
 * outside RehydrateInventory, are lint and code-review obligations rather than
 * type guarantees. The brands raise the cost of fabricating venue state from
 * "write an object" to "write a deliberate, greppable, reviewable assertion".
 */

import type { SupportedFeatureId } from './feature';

/** Opaque venue handle. Phase 0 state is local; no coordinates live here (§14). */
export type VenueId = string & { readonly __brand: 'VenueId' };

/**
 * Where a candidate came from.
 *
 * Provenance differs by source; the resulting CandidateFeature does not. Vision
 * carries model identity and confidence so its proposals stay auditable and so
 * precision can be measured against confirmations (§18).
 */
export type CandidateSource =
  | { readonly kind: 'manual-selection' }
  | {
      readonly kind: 'vision-inference';
      readonly modelVersion: string;
      /** Model confidence, 0-1. Never a threshold for skipping confirmation (§6.3). */
      readonly confidence: number;
    };

/**
 * A proposal that a supported feature may exist at a venue.
 *
 * A candidate is not venue state. Nothing downstream of confirmation may read
 * candidates, and no candidate reaches session generation (§6.3).
 */
export interface CandidateFeature {
  readonly featureId: SupportedFeatureId;
  readonly source: CandidateSource;
  readonly observedAt: string;
}

/**
 * The user's answer.
 *
 * `unsure` is a real outcome, not a soft yes. It is recorded and excluded from
 * the inventory: precision over recall, because a missed feature costs options
 * while an invented one creates physical risk (§6.3).
 */
export type ConfirmationDecision = 'present' | 'absent' | 'unsure';

/** One decision on one candidate. */
export interface FeatureConfirmation {
  readonly featureId: SupportedFeatureId;
  readonly decision: ConfirmationDecision;
  readonly decidedAt: string;
  /** Retained for measurement (§18); never consulted by the generator. */
  readonly candidateSource: CandidateSource;
}

/**
 * Whether a confirmed feature can currently be used (§6 step 7).
 *
 * `reported-unusable` is a distinct venue state, not a soft delete. The feature
 * exists and the confirmation stands; it is simply unavailable in practice —
 * occupied, flooded, damaged, fenced off. It stays in the inventory as venue
 * knowledge (§13) and is excluded from generation by projection, not removal.
 */
export type FeatureUsability =
  | { readonly kind: 'usable' }
  | {
      readonly kind: 'reported-unusable';
      readonly reportedAt: string;
      readonly note?: string;
    };

/** A feature the user confirmed present, with its current usability. */
export interface ConfirmedFeature {
  readonly featureId: SupportedFeatureId;
  readonly confirmedAt: string;
  readonly usability: FeatureUsability;
}

/**
 * Post-session correction (§6 step 7).
 *
 * Corrections can only withdraw or downgrade. There is deliberately no variant
 * that adds a feature, because feedback must never silently convert an
 * unsupported or unconfirmed object into a supported one.
 *
 * `feature-absent` withdraws the confirmation. `feature-unusable` keeps it and
 * marks the feature ineligible for generation. `feature-usable-again` restores
 * eligibility for a feature whose confirmation was never withdrawn — it cannot
 * introduce a feature, only clear a downgrade the user themselves applied.
 */
export type VenueCorrection =
  | { readonly kind: 'feature-absent'; readonly featureId: SupportedFeatureId }
  | {
      readonly kind: 'feature-unusable';
      readonly featureId: SupportedFeatureId;
      readonly note?: string;
    }
  | { readonly kind: 'feature-usable-again'; readonly featureId: SupportedFeatureId };

declare const featureSetWitness: unique symbol;
declare const confirmationWitness: unique symbol;
declare const generationViewWitness: unique symbol;

/**
 * A collection of confirmed features that this module produced.
 *
 * Intersected with the array type rather than wrapping it, because an array
 * spread (`[...set, fabricated]`) yields a plain array and loses the witness,
 * while an object spread of an array does not produce an array at all. That is
 * what closes the update-by-spread hole: an outer `{ ...inventory, features }`
 * still has to supply a features value this module built.
 */
export type ConfirmedFeatureSet = readonly ConfirmedFeature[] & {
  readonly [featureSetWitness]: true;
};

/**
 * Authoritative venue state (§6 step 6).
 *
 * Holds confirmed features in both usability states. Absent and unsure features
 * are not represented here; they live in the confirmation log used for
 * measurement.
 *
 * This type is not what generation reads — see GenerationVenueView.
 */
export interface ConfirmedVenueInventory {
  readonly [confirmationWitness]: true;
  readonly schemaVersion: number;
  readonly venueId: VenueId;
  /** Increments on every correction. Inventories are values, not mutable records. */
  readonly revision: number;
  readonly features: ConfirmedFeatureSet;
  readonly updatedAt: string;
}

/**
 * Opaque identity of the exact feature set a session was generated from.
 *
 * Carried through generation for provenance only. It is deliberately opaque so
 * that branching on it is meaningless.
 */
export type VenueSnapshotId = string & { readonly __brand: 'VenueSnapshotId' };

/**
 * The only venue information session generation may read.
 *
 * Contains confirmed, supported, currently usable feature identifiers and
 * nothing else. venueId, timestamps, revision numbers, candidate sources, and
 * unusable features are structurally absent, so generation cannot branch on
 * them. Two venues with the same usable features therefore produce the same
 * session — which is what makes Gate I's comparison meaningful.
 */
export interface GenerationVenueView {
  readonly [generationViewWitness]: true;
  readonly usableFeatures: UsableFeatureSet;
  readonly snapshotId: VenueSnapshotId;
}

/** Usable feature ids this module projected. Array-intersected for the same reason as ConfirmedFeatureSet. */
export type UsableFeatureSet = readonly SupportedFeatureId[] & {
  readonly [generationViewWitness]: true;
};

/** Inputs to the confirmation step. */
export interface ConfirmationInput {
  readonly venueId: VenueId;
  readonly candidates: readonly CandidateFeature[];
  readonly confirmations: readonly FeatureConfirmation[];
}

/**
 * Why rehydrating persisted state failed.
 *
 * Failure is a value, not an exception, so callers must handle it. A venue that
 * cannot be trusted is treated as no venue at all: the user is asked to
 * confirm again rather than shown a session built on unverifiable state.
 */
export type RehydrationFailure =
  | { readonly kind: 'malformed'; readonly detail: string }
  | { readonly kind: 'unsupported-schema-version'; readonly found: unknown }
  | { readonly kind: 'unknown-feature-id'; readonly found: unknown }
  | { readonly kind: 'invalid-usability'; readonly featureId: unknown };

export type RehydrationResult =
  | { readonly ok: true; readonly inventory: ConfirmedVenueInventory }
  | { readonly ok: false; readonly failure: RehydrationFailure };

/**
 * Producers. Implementations must live in this module; the witnesses above are
 * not exported, so no other module can satisfy these return types.
 */

/** Builds inventory from confirmations. Only `present` decisions enter it. */
export type ConfirmInventory = (input: ConfirmationInput) => ConfirmedVenueInventory;

/** Applies one correction, returning a new inventory at the next revision. */
export type ApplyCorrection = (
  inventory: ConfirmedVenueInventory,
  correction: VenueCorrection,
) => ConfirmedVenueInventory;

/**
 * The persistence boundary (§14).
 *
 * Accepts `unknown`, never a trusted shape. JSON.parse returns `any`, which
 * assigns to anything, so without this boundary the confirmation guarantee
 * holds in memory and evaporates across a reload. Validates against the
 * supported-feature registry before returning trusted state.
 */
export type RehydrateInventory = (raw: unknown) => RehydrationResult;

/**
 * Storage read port.
 *
 * Types persisted state as `unknown` rather than `any`, so no call site can
 * skip rehydration by assigning storage output straight into a trusted type.
 * `JSON.parse` returns `any` and must never be called outside this boundary;
 * that restriction is a lint and code-review obligation, not a type guarantee.
 */
export type ReadPersistedInventory = (venueId: VenueId) => unknown;

/** Projects inventory to the generation view, dropping everything generation may not use. */
export type ProjectGenerationView = (inventory: ConfirmedVenueInventory) => GenerationVenueView;
