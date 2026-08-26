/**
 * Assembling venue state: the glue between a UI and the confirmation boundary.
 *
 * Shared by both clients (§15). Nothing here constructs venue state — it can't.
 * Only src/domain/confirmation.ts can, and only through rehydration or
 * confirmation. What this module owns is the *call* into that boundary, and
 * that call has to exist exactly once.
 *
 * `commitConfirmations` is the single place a UI can produce confirmed
 * inventory. A per-client copy of it would be a second place, which is what
 * invariant 3 — one path into generation — exists to prevent. A native client
 * re-typing this would not look like a violation; it would look like glue.
 *
 * The clock stays outside: every function takes the time it needs, because the
 * domain refuses to read one and this module has no better claim to.
 */

import {
  confirmInventory,
  makeVenueId,
  rehydrateInventoryFromJson,
  toPersistable,
} from '../domain/confirmation.ts';
import type {
  CandidateFeature,
  ConfirmedVenueInventory,
  ConfirmationDecision,
  FeatureConfirmation,
  RehydrationFailure,
} from '../domain/confirmation.ts';
import type { SupportedFeatureId } from '../domain/feature.ts';
import { createInventoryStore } from './inventory-store.ts';
import type { StorageLike } from './port.ts';

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

export type LoadOutcome =
  | { readonly kind: 'none' }
  | { readonly kind: 'loaded'; readonly inventory: ConfirmedVenueInventory }
  | { readonly kind: 'unusable'; readonly failure: RehydrationFailure };

export interface VenueStateStore {
  readonly load: () => LoadOutcome;
  readonly save: (inventory: ConfirmedVenueInventory) => void;
  readonly clear: () => void;
}

/**
 * Reads and writes persisted venue state through whichever store it is given.
 *
 * Reads fail closed: anything that does not survive rehydration is reported as
 * unusable and treated as no venue, so the user is asked to confirm again
 * rather than shown a session built on state we cannot trust. That is a product
 * decision, not a platform one, which is why it lives here rather than in each
 * client's binding.
 */
export const createVenueState = (storage: StorageLike): VenueStateStore => {
  const store = createInventoryStore(storage);
  return {
    load: () => {
      const text = store.read(VENUE_ID);
      if (text === null) return { kind: 'none' };
      const result = rehydrateInventoryFromJson(text);
      if (!result.ok) return { kind: 'unusable', failure: result.failure };
      return { kind: 'loaded', inventory: result.inventory };
    },
    save: (inventory) => store.write(VENUE_ID, toPersistable(inventory)),
    clear: () => store.clear(VENUE_ID),
  };
};

/** Selecting a feature produces a candidate. Nothing more. */
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
 * The single place a UI can produce confirmed inventory.
 *
 * An undecided candidate defaults to `unsure`, never to `present`: precision
 * over recall, because a missed feature costs options while an invented one
 * creates physical risk (§6.3).
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

/**
 * Restores confirmation decisions from recorded authority.
 *
 * Revisiting confirmation used to start blank, so continuing replaced a
 * populated inventory with an empty one — a confirmed park erased by an
 * ordinary back-navigation, with the destructive path sitting under the primary
 * action.
 *
 * Only `present` decisions ever produce a confirmed feature, so a feature
 * recorded in the inventory *is* a recorded Yes and may be shown as one. That
 * is the whole rule: **reconstruct from recorded authority, never invent it**.
 * A candidate that has merely been proposed restores nothing, because the
 * precision-over-recall default (Invariant 4) governs a first pass and this must
 * not become a way of answering on the user's behalf.
 */
export const restoreDecisions = (
  inventory: ConfirmedVenueInventory | null,
): ReadonlyMap<SupportedFeatureId, ConfirmationDecision> => {
  const restored = new Map<SupportedFeatureId, ConfirmationDecision>();
  for (const feature of inventory?.features ?? []) {
    restored.set(feature.featureId, 'present');
  }
  return restored;
};
