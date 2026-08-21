// @expect TS2322 an unvalidated number cannot be used as a session duration
import type { SessionGenerationInput } from '../../../src/domain/session.ts';
export const input: SessionGenerationInput = {
  venue: null, availableMinutes: -30, goal: 'strength',
  conditions: { kind: 'acceptable' }, seed: 's', matrixVersion: '1',
};
