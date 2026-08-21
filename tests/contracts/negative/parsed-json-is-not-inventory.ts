// @expect TS2322 an unknown value cannot become venue state without the rehydration boundary
import type { ConfirmedVenueInventory } from '../../../src/domain/confirmation.ts';
declare const parsed: unknown;
export const trusted: ConfirmedVenueInventory = parsed;
