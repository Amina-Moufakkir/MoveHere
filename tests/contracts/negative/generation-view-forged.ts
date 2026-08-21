// @expect TS2741 a generation view cannot be assembled outside the confirmation module
import type { GenerationVenueView, UsableFeatureSet, VenueSnapshotId } from '../../../src/domain/confirmation.ts';
declare const usableFeatures: UsableFeatureSet;
export const forged: GenerationVenueView = {
  usableFeatures, snapshotId: 's' as VenueSnapshotId,
};
