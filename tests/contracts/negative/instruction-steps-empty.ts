// @expect TS2322 an authored instruction cannot carry zero steps
import type { InstructionState } from '../../../src/domain/exercise.ts';

export const empty: InstructionState = {
  kind: 'authored',
  steps: [],
  authority: { status: 'project-content', authoredAt: '2026-08-23', basisRefs: ['x'] },
};
