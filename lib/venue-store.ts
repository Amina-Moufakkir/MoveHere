/**
 * Web binding for venue state.
 *
 * Everything that decides what venue state is, how it is assembled, and whether
 * a persisted one can be trusted lives in src/storage/venue-state.ts and is
 * shared with the native client. All that is left here is the choice of where
 * the strings go.
 *
 * One fallback store, not one per call: server rendering has no localStorage,
 * and a fresh memory store on every access would mean nothing ever round-trips.
 */

import { createVenueState } from '../src/storage/venue-state.ts';
import { createMemoryStorage } from '../src/storage/port.ts';
import type { ConfirmedVenueInventory } from '../src/domain/confirmation.ts';

export { VENUE_ID, candidatesFrom, commitConfirmations } from '../src/storage/venue-state.ts';
export type { LoadOutcome } from '../src/storage/venue-state.ts';

const fallback = createMemoryStorage();

const state = () =>
  createVenueState(typeof window === 'undefined' ? fallback : window.localStorage);

export const loadInventory = () => state().load();

export const saveInventory = (inventory: ConfirmedVenueInventory): void =>
  state().save(inventory);

export const clearInventory = (): void => state().clear();
