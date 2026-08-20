// @expect TS2820 no correction variant can add a feature to a venue
import type { VenueCorrection } from '../../../src/domain/confirmation';
export const additive: VenueCorrection = { kind: 'feature-present', featureId: 'pull-up-bar' };
