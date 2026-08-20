/**
 * Phase 0 domain contracts.
 *
 * Types only. No implementation, no dependencies, no framework. The canonical
 * plan (docs/product-plan-v4.3.md) governs; where these types and the plan
 * disagree, the plan wins.
 */

export {
  SESSION_DURATIONS,
  makeSessionMinutes,
  makeEstimatedMinutes,
} from './session';

export type * from './feature';
export type * from './confirmation';
export type * from './exercise';
export type * from './session';
