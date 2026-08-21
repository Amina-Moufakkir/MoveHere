/**
 * UI-side glue between the browser and the confirmation boundary.
 *
 * The domain stays pure: this module owns the clock, owns localStorage, and
 * hands the domain plain values. Nothing here constructs venue state — it can't.
 * Only src/domain/confirmation.ts can, and only through rehydration or
 * confirmation.
 */

import {
  confirmInventory,
  makeVenueId,
  rehydrateInventoryFromJson,
  toPersistable,
} from '../src/domain/confirmation.ts';
import type {
  CandidateFeature,
  ConfirmedVenueInventory,
  ConfirmationDecision,
  FeatureConfirmation,
  RehydrationFailure,
} from '../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../src/domain/feature.ts';
import { createInventoryStore, createMemoryStorage } from '../src/storage/inventory-store.ts';

const HOME_PARK = makeVenueId('home-park');

/**
 * The MVP tracks one venue. Multi-venue is out of scope.
 *
 * Built through the domain constructor rather than asserted here. The null
 * branch cannot be reached by a non-empty literal, but leaving it unhandled
 * would mean asserting again under a different name.
 */
if (HOME_PARK === null) throw new Error('home-park is not a usable venue id');

export const VENUE_ID = HOME_PARK;

/**
 * One fallback store, not one per call.
 *
 * Server rendering and tests have no localStorage; creating a fresh memory
 * store on every access would mean nothing ever round-trips.
 */
const fallback = createMemoryStorage();

const store = () =>
  createInventoryStore(typeof window === 'undefined' ? fallback : window.localStorage);

export type LoadOutcome =
  | { readonly kind: 'none' }
  | { readonly kind: 'loaded'; readonly inventory: ConfirmedVenueInventory }
  | { readonly kind: 'unusable'; readonly failure: RehydrationFailure };

/**
 * Reads persisted venue state.
 *
 * Fails closed: anything that does not survive rehydration is reported as
 * unusable and treated as no venue, so the user is asked to confirm again
 * rather than shown a session built on state we cannot trust.
 */
export const loadInventory = (): LoadOutcome => {
  const text = store().read(VENUE_ID);
  if (text === null) return { kind: 'none' };
  const result = rehydrateInventoryFromJson(text);
  if (!result.ok) return { kind: 'unusable', failure: result.failure };
  return { kind: 'loaded', inventory: result.inventory };
};

export const saveInventory = (inventory: ConfirmedVenueInventory): void => {
  store().write(VENUE_ID, toPersistable(inventory));
};

export const clearInventory = (): void => store().clear(VENUE_ID);

/** Selecting a feature on /park produces a candidate. Nothing more. */
export const candidatesFrom = (
  featureIds: readonly SupportedFeatureId[],
  at: string,
): readonly CandidateFeature[] =>
  featureIds.map((featureId) => ({
    featureId,
    source: { kind: 'manual-selection' },
    observedAt: at,
  }));

/**
 * The single place the UI can produce confirmed inventory.
 *
 * Timestamps come from here because the domain refuses to read a clock.
 */
export const commitConfirmations = (
  candidates: readonly CandidateFeature[],
  decisions: ReadonlyMap<SupportedFeatureId, ConfirmationDecision>,
  now: string,
) => {
  const confirmations: FeatureConfirmation[] = candidates.map((candidate) => ({
    featureId: candidate.featureId,
    decision: decisions.get(candidate.featureId) ?? 'unsure',
    decidedAt: now,
    candidateSource: candidate.source,
  }));

  return confirmInventory({ venueId: VENUE_ID, candidates, confirmations, at: now });
};
