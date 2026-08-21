// @expect TS2322 spreading a real inventory cannot inject an unconfirmed feature
import type { ConfirmedVenueInventory, ConfirmedFeature } from '../../../src/domain/confirmation.ts';
declare const real: ConfirmedVenueInventory;
declare const fabricated: ConfirmedFeature;
export const forged: ConfirmedVenueInventory = {
  ...real,
  features: [...real.features, fabricated],
};
