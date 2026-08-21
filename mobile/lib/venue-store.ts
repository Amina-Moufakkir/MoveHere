/**
 * Native binding for venue state.
 *
 * The mirror of the web client's lib/venue-store.ts: it picks a store and
 * nothing else. Assembly, the fail-closed load outcome, and the single path
 * into confirmed inventory all live in shared src/storage/venue-state.ts.
 */

import { createVenueState } from '../../src/storage/venue-state.ts';
import type { ConfirmedVenueInventory } from '../../src/domain/confirmation.ts';
import { nativeStorage } from './storage.ts';

export { VENUE_ID, candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
export type { LoadOutcome } from '../../src/storage/venue-state.ts';

const state = createVenueState(nativeStorage);

export const loadInventory = () => state.load();

export const saveInventory = (inventory: ConfirmedVenueInventory): void => state.save(inventory);

export const clearInventory = (): void => state.clear();
