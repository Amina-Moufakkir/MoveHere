// @expect TS2322 an instruction context cannot be an invented kind
import type { InstructionContext } from '../../../src/domain/exercise.ts';

export const invented: InstructionContext = { kind: 'any-park' };
