/**
 * The single path from observation to authoritative venue state.
 *
 * Canonical plan: §6 steps 2-3 and 7, §7, §14.
 *
 *     candidate  ->  confirmation  ->  confirmed venue inventory
 *
 * Manual feature selection and any future vision detection are both sources of
 * candidates and nothing more. Neither writes confirmed state directly, and
 * vision does not get a second route into generation (CLAUDE.md invariant 3).
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
 * Post-session correction (§6 step 7).
 *
 * Corrections can only withdraw or downgrade. There is deliberately no variant
 * that adds a feature, because feedback must never silently convert an
 * unsupported or unconfirmed object into a supported one.
 */
export type VenueCorrection =
  | { readonly kind: 'feature-absent'; readonly featureId: SupportedFeatureId }
  | { readonly kind: 'feature-unusable'; readonly featureId: SupportedFeatureId; readonly note?: string };

/** A feature the user confirmed present and has not since withdrawn. */
export interface ConfirmedFeature {
  readonly featureId: SupportedFeatureId;
  readonly confirmedAt: string;
}

/**
 * Brand witnessing that this value passed through confirmation.
 *
 * Not exported. Any module that tries to assemble a ConfirmedVenueInventory
 * from candidates, vision output, or a literal fails to typecheck. The function
 * that produces one must be implemented in this module.
 */
declare const confirmationWitness: unique symbol;

/**
 * The only venue state the generator may read (§6 step 6).
 *
 * Contains present features only. Absent, unsure, and corrected-away features
 * are not represented here; they live in the confirmation log used for
 * measurement.
 */
export interface ConfirmedVenueInventory {
  readonly [confirmationWitness]: true;
  readonly venueId: VenueId;
  /** Increments on every correction. Inventories are values, not mutable records. */
  readonly revision: number;
  readonly features: readonly ConfirmedFeature[];
  readonly updatedAt: string;
}

/** Inputs to the confirmation step. Implementation belongs in this module (see brand). */
export interface ConfirmationInput {
  readonly venueId: VenueId;
  readonly candidates: readonly CandidateFeature[];
  readonly confirmations: readonly FeatureConfirmation[];
}
