// @expect TS2322 an authored instruction must declare the context it constructs
import type { InstructionState } from '../../../src/domain/exercise.ts';

export const undeclared: InstructionState = {
  kind: 'authored',
  steps: [{ kind: 'setup', text: 'Stand tall' }, { kind: 'action', text: 'Sit back and down' }],
  authority: { status: 'project-content', authoredAt: '2026-08-23', basisRefs: ['x'] },
};
