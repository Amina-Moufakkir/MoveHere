// @expect TS2322 a generation view cannot have features swapped in by spread
import type { GenerationVenueView } from '../../../src/domain/confirmation.ts';
declare const view: GenerationVenueView;
export const forged: GenerationVenueView = { ...view, usableFeatures: ['pull-up-bar'] };
