// @expect TS2322 a phase override cannot carry draft authority
import type { InstructionOverride } from '../../../src/domain/exercise.ts';
import type { SupportedFeatureId } from '../../../src/domain/feature.ts';

export const drafted: InstructionOverride = {
  featureId: 'park-bench' as SupportedFeatureId,
  replaces: 'setup',
  steps: [{ kind: 'setup', text: 'Rear foot on the bench' }],
  authority: { status: 'draft' },
};
