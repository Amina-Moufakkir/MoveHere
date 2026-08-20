// @expect TS2322 conditions cannot be reported as an untyped unknown state
import type { ConditionsAssessment } from '../../../src/domain/session';
export const c: ConditionsAssessment = { kind: 'unknown' };
