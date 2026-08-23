// @expect TS2322 an authored instruction cannot carry draft authority
import type { InstructionState } from '../../../src/domain/exercise.ts';

export const drafted: InstructionState = {
  kind: 'authored',
  steps: [{ kind: 'setup', text: 'Stand tall' }],
  authority: { status: 'draft' },
};
