// @expect TS2322 a requested duration cannot stand in for a session estimate
import type { SessionMinutes, EstimatedMinutes } from '../../../src/domain/session.ts';
declare const requested: SessionMinutes;
export const estimate: EstimatedMinutes = requested;
