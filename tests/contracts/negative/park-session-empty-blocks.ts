// @expect TS2322 a park session cannot contain zero blocks
import type {
  SessionGenerationOutput,
  EstimatedMinutes,
  GenerationProvenance,
} from '../../../src/domain/session.ts';
declare const estimate: EstimatedMinutes;
declare const provenance: GenerationProvenance;
export const empty: SessionGenerationOutput = {
  kind: 'park-session', blocks: [], estimatedMinutes: estimate,
  featuresUsed: ['park-bench'], provenance,
};
