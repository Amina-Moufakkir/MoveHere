// @expect TS2741 an inventory cannot be assembled from an object literal
import type { ConfirmedVenueInventory, VenueId, ConfirmedFeatureSet } from '../../../src/domain/confirmation';
declare const features: ConfirmedFeatureSet;
export const forged: ConfirmedVenueInventory = {
  schemaVersion: 1, venueId: 'v' as VenueId, revision: 1, features, updatedAt: 'x',
};
