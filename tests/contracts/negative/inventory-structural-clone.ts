// @expect TS2741 an outside module cannot satisfy the inventory shape structurally
import type { ConfirmedVenueInventory, VenueId, ConfirmedFeature } from '../../../src/domain/confirmation.ts';
interface MyInventory {
  schemaVersion: number; venueId: VenueId; revision: number;
  features: readonly ConfirmedFeature[]; updatedAt: string;
}
declare const mine: MyInventory;
export const forged: ConfirmedVenueInventory = mine;
