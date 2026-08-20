// @expect TS2322 persisted state typed unknown cannot bypass the rehydration boundary
import type { ConfirmedVenueInventory, ReadPersistedInventory, VenueId } from '../../../src/domain/confirmation';
declare const read: ReadPersistedInventory;
export const trusted: ConfirmedVenueInventory = read('v' as VenueId);
