// @expect TS2322 declining to write an instruction requires stating why
import type { InstructionState } from '../../../src/domain/exercise.ts';

export const unexplained: InstructionState = { kind: 'not-required' };
