// @expect TS2322 the mixed session goal is not part of Phase 0
import type { SessionGoal } from '../../../src/domain/session.ts';
export const goal: SessionGoal = 'mixed';
