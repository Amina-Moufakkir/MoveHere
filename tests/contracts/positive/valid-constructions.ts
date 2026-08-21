/**
 * Positive contract tests.
 *
 * Every value here must compile. Their job is to catch over-constraint: a type
 * that forbids a legitimate product state is as much a defect as one that
 * permits an illegitimate one. Branded values arrive via `declare const`
 * because only the owning module can construct them.
 */

import type {
  ConfirmedVenueInventory,
  ConfirmedFeature,
  GenerationVenueView,
  VenueCorrection,
  RehydrationResult,
  CandidateFeature,
  FeatureConfirmation,
} from '../../../src/domain/confirmation.ts';
import type {
  SessionGenerationInput,
  SessionGenerationOutput,
  SessionBlock,
  SessionMinutes,
  EstimatedMinutes,
  GenerationProvenance,
  SelectionBasis,
  ConditionsAssessment,
  ConditionsDisposition,
  GenerationContext,
} from '../../../src/domain/session.ts';
import type { ValidatedMatrix } from '../../../src/domain/matrix-loader.ts';
import type { UsableGoalPolicy } from '../../../src/domain/policy-loader.ts';
import type { GenerationSeed } from '../../../src/domain/prng.ts';
import type { SupportedFeature, ExcludedObject } from '../../../src/domain/feature.ts';
import type {
  ContentAuthority,
  CompatibilityEntryId,
  EnvironmentIndependentDeclarationId,
} from '../../../src/domain/exercise.ts';

declare const minutes: SessionMinutes;
declare const estimate: EstimatedMinutes;
declare const provenance: GenerationProvenance;
declare const block: SessionBlock;
declare const view: GenerationVenueView;
declare const inventory: ConfirmedVenueInventory;

// A vision candidate and a manual candidate share one shape.
export const visionCandidate: CandidateFeature = {
  featureId: 'pull-up-bar',
  source: { kind: 'vision-inference', modelVersion: 'v1', confidence: 0.9 },
  observedAt: '2026-08-20T10:00:00Z',
};
export const manualCandidate: CandidateFeature = {
  featureId: 'pull-up-bar',
  source: { kind: 'manual-selection' },
  observedAt: '2026-08-20T10:00:00Z',
};

// All three confirmation decisions are expressible.
export const decisions: readonly FeatureConfirmation[] = [
  { featureId: 'park-bench', decision: 'present', decidedAt: 't', candidateSource: { kind: 'manual-selection' } },
  { featureId: 'stairs', decision: 'absent', decidedAt: 't', candidateSource: { kind: 'manual-selection' } },
  { featureId: 'hill', decision: 'unsure', decidedAt: 't', candidateSource: { kind: 'manual-selection' } },
];

// A confirmed feature may be present but unusable, and stay venue knowledge.
export const unusable: ConfirmedFeature = {
  featureId: 'pull-up-bar',
  confirmedAt: 't',
  usability: { kind: 'reported-unusable', reportedAt: 't', note: 'fenced off' },
};
export const usable: ConfirmedFeature = {
  featureId: 'park-bench',
  confirmedAt: 't',
  usability: { kind: 'usable' },
};

// Every correction direction the plan allows.
export const corrections: readonly VenueCorrection[] = [
  { kind: 'feature-absent', featureId: 'stairs', occurredAt: 't' },
  { kind: 'feature-unusable', featureId: 'pull-up-bar', occurredAt: 't', note: 'occupied' },
  { kind: 'feature-usable-again', featureId: 'pull-up-bar', occurredAt: 't' },
];

// Rehydration succeeds or fails; both are expressible.
export const rehydrated: readonly RehydrationResult[] = [
  { ok: true, inventory },
  { ok: false, failure: { kind: 'unknown-feature-id', found: 'trampoline' } },
];

// All three conditions states.
export const conditions: readonly ConditionsAssessment[] = [
  { kind: 'acceptable' },
  { kind: 'adverse', signals: ['precipitation'] },
  { kind: 'unavailable' },
];

declare const matrix: ValidatedMatrix;
declare const policy: UsableGoalPolicy;
declare const seed: GenerationSeed;

// Both generation contexts.
export const contexts: readonly GenerationContext[] = [
  { kind: 'venue-aware', venue: view },
  { kind: 'environment-independent' },
];

// Both dispositions, with the two withheld causes kept distinct.
export const dispositions: readonly ConditionsDisposition[] = [
  { kind: 'park-permitted' },
  { kind: 'park-withheld', cause: { kind: 'adverse', signals: ['freezing'] } },
  { kind: 'park-withheld', cause: { kind: 'unavailable' } },
];

// A first session with no venue at all.
export const firstSession: SessionGenerationInput = {
  context: { kind: 'environment-independent' },
  policy, matrix, availableMinutes: minutes,
  conditions: { kind: 'park-permitted' }, seed,
};

// A venue-aware session.
export const parkInput: SessionGenerationInput = {
  context: { kind: 'venue-aware', venue: view },
  policy, matrix, availableMinutes: minutes,
  conditions: { kind: 'park-permitted' }, seed,
};

// Both selection bases carry their authority.
export const bases: readonly SelectionBasis[] = [
  {
    kind: 'confirmed-feature',
    featureId: 'park-bench',
    compatibilityId: 'cmp-bench-step-up' as CompatibilityEntryId,
    authority: { matrixVersion: '1', tier: 'project-content', attestedAt: 't' },
  },
  {
    kind: 'environment-independent',
    declarationId: 'ei-squat' as EnvironmentIndependentDeclarationId,
    authority: { matrixVersion: '1', tier: 'reviewed', attestedAt: 't' },
  },
];

// Every output kind, including all four substitute reasons.
export const outputs: readonly SessionGenerationOutput[] = [
  { kind: 'park-session', blocks: [block], estimatedMinutes: estimate, featuresUsed: ['park-bench'], provenance },
  { kind: 'substitute-session', reason: { kind: 'conditions-adverse', signals: ['freezing'] }, blocks: [block], estimatedMinutes: estimate, provenance },
  { kind: 'substitute-session', reason: { kind: 'conditions-unavailable' }, blocks: [block], estimatedMinutes: estimate, provenance },
  { kind: 'substitute-session', reason: { kind: 'no-confirmed-inventory' }, blocks: [block], estimatedMinutes: estimate, provenance },
  { kind: 'substitute-session', reason: { kind: 'no-compatible-venue-movements' }, blocks: [block], estimatedMinutes: estimate, provenance },
  { kind: 'not-generated', reason: 'insufficient-time' },
  { kind: 'not-generated', reason: 'no-movements-available' },
];

// Registry entries, supported and excluded.
export const bench: SupportedFeature = {
  id: 'park-bench', featureClass: 'class-b-engineered-load-bearing',
  label: 'Park bench', confirmationPrompt: 'Is there a bench you can use?',
};
export const bleachers: ExcludedObject = {
  id: 'bleachers', featureClass: 'class-c-excluded', label: 'Bleachers',
  exclusionReason: 'Fixed and portable construction cannot be reliably distinguished.',
  reconsiderWhen: 'Park audits establish prevalence and reliable distinguishability.',
};

// All three authority tiers are expressible, with their differing obligations.
export const authorities: readonly ContentAuthority[] = [
  { status: 'draft' },
  { status: 'project-content', authoredAt: 't', basisRefs: ['general-fitness conventions'] },
  {
    status: 'reviewed',
    reviewedAt: 't',
    reviewerRef: 'r',
    credentialRef: 'c',
    sourceRefs: ['s'],
    scope: 'general-fitness',
  },
];
