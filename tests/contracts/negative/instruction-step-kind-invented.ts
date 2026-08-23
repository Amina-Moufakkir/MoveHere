// @expect TS2322 a step kind outside setup/action/return cannot be invented
import type { MovementStep } from '../../../src/domain/exercise.ts';

export const invented: MovementStep = { kind: 'cue', text: 'Elbows back, not flared' };
