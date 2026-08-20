// @expect TS2322 an unvalidated number cannot be used as a session estimate
import type { EstimatedMinutes } from '../../../src/domain/session';
export const estimate: EstimatedMinutes = 27;
