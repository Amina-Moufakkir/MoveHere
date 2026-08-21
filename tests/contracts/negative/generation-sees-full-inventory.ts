// @expect TS2739 generation cannot consume the full inventory, only the narrowed view
import type { ConfirmedVenueInventory } from '../../../src/domain/confirmation.ts';
import type { SessionGenerationInput, SessionMinutes } from '../../../src/domain/session.ts';
declare const inventory: ConfirmedVenueInventory;
declare const minutes: SessionMinutes;
export const input: SessionGenerationInput = {
  venue: inventory, availableMinutes: minutes, goal: 'strength',
  conditions: { kind: 'acceptable' }, seed: 's', matrixVersion: '1',
};
