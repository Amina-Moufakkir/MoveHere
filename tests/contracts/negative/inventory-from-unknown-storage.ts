// @expect TS2322 raw persisted text cannot be treated as venue state
import type { ConfirmedVenueInventory, ReadPersistedInventory, VenueId } from '../../../src/domain/confirmation.ts';
declare const read: ReadPersistedInventory;
export const trusted: ConfirmedVenueInventory = read('v' as VenueId);
