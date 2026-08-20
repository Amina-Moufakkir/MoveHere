/**
 * Deterministic session generation contracts.
 *
 * Canonical plan: §6 steps 4-6, §10, §11, §16 (Gates E, I, J), §18.
 *
 * Generation is a pure function of its input. The same input must always
 * produce the same output, so sessions can be compared across venues (Gate I)
 * and against venue-blind alternatives (Gate J).
 */

import type { SupportedFeatureId } from './feature';
import type { ConfirmedVenueInventory } from './confirmation';
import type { ExerciseId, Prescription } from './exercise';

/**
 * Session goal (§6 step 4).
 *
 * A combined or "mixed" goal is deliberately absent: its semantics are not
 * defined well enough to enter generation, and an underspecified goal would
 * make sessions harder to compare under Gates I and J.
 */
export type SessionGoal = 'strength' | 'conditioning' | 'mobility';

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
 * Assessed before generation, not inside it, so generation stays a pure
 * function and the gate can be evaluated and logged independently.
 */
export type ConditionsAssessment =
  | { readonly kind: 'acceptable' }
  | { readonly kind: 'unacceptable'; readonly signals: readonly ConditionSignal[] }
  | { readonly kind: 'unknown' };

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
  /**
   * Confirmed venue state, or null when nothing has been confirmed yet.
   *
   * null is the first-session case (§6 step 1) and resolves to
   * environment-independent movements only. It never means "assume a typical
   * park": MoveHere must not silently assume a bench, bar, or stairs exists.
   */
  readonly inventory: ConfirmedVenueInventory | null;
  readonly availableMinutes: number;
  readonly goal: SessionGoal;
  readonly conditions: ConditionsAssessment;
  /** Makes any variation reproducible. Same seed and inputs, same session. */
  readonly seed: string;
  readonly matrixVersion: string;
}

/**
 * Why a given item is permitted to appear in a session.
 *
 * Every item must cite one of exactly two justifications (§6 step 6). Recording
 * the basis in the output makes the invariant auditable in data rather than
 * only in code, and makes the substitution rate in §18 directly measurable.
 */
export type SelectionBasis =
  | { readonly kind: 'confirmed-feature'; readonly featureId: SupportedFeatureId }
  | { readonly kind: 'environment-independent' };

export interface SessionItem {
  readonly exerciseId: ExerciseId;
  readonly prescription: Prescription;
  readonly basis: SelectionBasis;
  readonly variationLabel?: string;
}

export interface SessionBlock {
  readonly name: string;
  readonly items: readonly SessionItem[];
}

/** Provenance carried by every generated session, so any session can be reproduced. */
export interface GenerationProvenance {
  readonly generatorVersion: string;
  readonly matrixVersion: string;
  readonly seed: string;
  readonly inventoryRevision: number | null;
}

/**
 * The result of generation.
 *
 * A park session and a substitute session are different kinds, not one kind
 * with a flag, because §11 requires the substitute be labeled as a substitute
 * and never presented as a park session. `not-generated` is explicit so the
 * caller cannot mistake an empty session for a valid one.
 */
export type SessionGenerationOutput =
  | {
      readonly kind: 'park-session';
      readonly blocks: readonly SessionBlock[];
      readonly estimatedMinutes: number;
      readonly featuresUsed: readonly SupportedFeatureId[];
      readonly provenance: GenerationProvenance;
    }
  | {
      readonly kind: 'substitute-session';
      /** Why the park session was not offered: failed gate, or nothing confirmed. */
      readonly reason: 'conditions-gate-failed' | 'no-confirmed-inventory';
      readonly blocks: readonly SessionBlock[];
      readonly estimatedMinutes: number;
      readonly provenance: GenerationProvenance;
    }
  | {
      readonly kind: 'not-generated';
      readonly reason: 'insufficient-time' | 'no-compatible-movements';
    };

/**
 * The generator.
 *
 * Pure and total: no clock, no randomness outside the seed, no I/O, no network.
 * Every substitute session must be surfaced to the user as a substitute.
 */
export type GenerateSession = (input: SessionGenerationInput) => SessionGenerationOutput;
