// @expect TS2339 a rehydration result cannot be used without checking whether it succeeded
import { rehydrateInventoryFromJson } from '../../../src/domain/confirmation.ts';
import type { ConfirmedVenueInventory } from '../../../src/domain/confirmation.ts';
const result = rehydrateInventoryFromJson('{}');
export const trusted: ConfirmedVenueInventory = result.inventory;
