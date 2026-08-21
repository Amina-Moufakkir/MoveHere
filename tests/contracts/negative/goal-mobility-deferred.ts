// @expect TS2322 mobility is deferred and is not a supported session goal
import type { SessionGoal } from '../../../src/domain/session.ts';
export const goal: SessionGoal = 'mobility';
