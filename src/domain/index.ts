/**
 * The domain surface, shared by both clients (§15).
 *
 * The canonical plan (docs/product-plan-v4.3.md) governs; where these types and
 * the plan disagree, the plan wins.
 */

export {
  SESSION_DURATIONS,
  makeSessionMinutes,
  makeEstimatedMinutes,
} from './session.ts';

export {
  INVENTORY_SCHEMA_VERSION,
  confirmInventory,
  applyCorrection,
  projectGenerationView,
  rehydrateInventory,
  rehydrateInventoryFromJson,
  toPersistable,
} from './confirmation.ts';

export {
  FEATURE_REGISTRY,
  isSupportedFeatureId,
  findSupportedFeature,
} from './feature-registry.ts';

export { AUTHORED_MATRIX, EXERCISES } from './exercise-catalog.ts';
export { loadMatrix } from './matrix-loader.ts';

export type * from './feature.ts';
export type * from './confirmation.ts';
export type * from './exercise.ts';
export type * from './session.ts';
export type * from './matrix-loader.ts';
