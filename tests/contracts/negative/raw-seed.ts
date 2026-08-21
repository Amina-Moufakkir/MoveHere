// @expect TS2322 an unbranded string cannot be used as a generation seed
import type { SessionGenerationInput, SessionMinutes } from '../../../src/domain/session.ts';
import type { ValidatedMatrix } from '../../../src/domain/matrix-loader.ts';
import type { UsableGoalPolicy } from '../../../src/domain/policy-loader.ts';
declare const minutes: SessionMinutes;
declare const matrix: ValidatedMatrix;
declare const policy: UsableGoalPolicy;
export const input: SessionGenerationInput = {
  context: { kind: 'environment-independent' },
  policy, matrix, availableMinutes: minutes,
  conditions: { kind: 'park-permitted' }, seed: 'abc',
};
