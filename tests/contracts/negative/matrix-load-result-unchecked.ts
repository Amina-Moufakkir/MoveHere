// @expect TS2339 a matrix load result cannot be used without checking whether it succeeded
import { loadMatrix } from '../../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../../../src/domain/exercise-catalog.ts';
import type { ValidatedMatrix } from '../../../src/domain/matrix-loader.ts';
const result = loadMatrix(AUTHORED_MATRIX);
export const matrix: ValidatedMatrix = result.matrix;
