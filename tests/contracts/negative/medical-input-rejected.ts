// @expect TS2353 generation input has no field for injury or medical condition
import type { SessionGenerationInput, SessionMinutes } from '../../../src/domain/session.ts';
declare const minutes: SessionMinutes;
export const input: SessionGenerationInput = {
  venue: null, availableMinutes: minutes, goal: 'strength',
  conditions: { kind: 'acceptable' }, seed: 's', matrixVersion: '1',
  injuries: ['left knee'],
};
