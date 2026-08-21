// @expect TS2739 generation cannot consume the full inventory, only the narrowed view
import type { ConfirmedVenueInventory } from '../../../src/domain/confirmation.ts';
import type { GenerationContext } from '../../../src/domain/session.ts';
declare const inventory: ConfirmedVenueInventory;
export const context: GenerationContext = { kind: 'venue-aware', venue: inventory };
