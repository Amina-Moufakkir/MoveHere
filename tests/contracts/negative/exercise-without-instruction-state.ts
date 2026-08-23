// @expect TS2741 an exercise must declare an instruction state, not omit one
import type { Exercise, ExerciseId } from '../../../src/domain/exercise.ts';

export const silent: Exercise = {
  id: 'x' as ExerciseId,
  name: 'X',
  pattern: 'core',
  laterality: 'bilateral',
  prescriptionKinds: ['reps'],
  countingModes: ['total'],
  cues: ['something'],
};
