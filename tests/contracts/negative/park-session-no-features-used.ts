// @expect TS2322 a park session that used no confirmed feature is not a park session
import type { SessionGenerationOutput, EstimatedMinutes, SessionBlock, GenerationProvenance } from '../../../src/domain/session.ts';
declare const estimate: EstimatedMinutes;
declare const block: SessionBlock;
declare const provenance: GenerationProvenance;
export const featureless: SessionGenerationOutput = {
  kind: 'park-session', blocks: [block], estimatedMinutes: estimate,
  featuresUsed: [], provenance,
};
