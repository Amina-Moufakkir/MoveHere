// @expect TS2741 a validated matrix cannot be assembled outside its loader
import type { ValidatedMatrix } from '../../../src/domain/matrix-loader.ts';
import type { MatrixVersion } from '../../../src/domain/exercise.ts';
export const forged: ValidatedMatrix = {
  version: '1' as MatrixVersion,
  authorityTier: 'reviewed',
  exercises: [],
  compatibilities: [],
  environmentIndependent: [],
};
