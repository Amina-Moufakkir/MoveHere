// @expect TS2322 an excluded object cannot be typed as a supported feature
import type { SupportedFeature } from '../../../src/domain/feature';
export const bad: SupportedFeature = {
  id: 'park-bench', featureClass: 'class-c-excluded', label: 'x', confirmationPrompt: 'x',
};
