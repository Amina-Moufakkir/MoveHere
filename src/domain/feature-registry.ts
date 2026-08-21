/**
 * The supported-feature registry (§7).
 *
 * Project content: labels and confirmation prompts are product copy, not
 * fitness programming, so nothing here depends on domain review.
 *
 * Confirmation prompts ask about existence and usability only. None of them
 * asks whether something is safe, because MoveHere has no authority to make
 * that assessment (§9).
 */

import type {
  FeatureRegistry,
  SupportedFeature,
  SupportedFeatureId,
  ExcludedObject,
} from './feature.ts';

const SUPPORTED: readonly SupportedFeature[] = [
  {
    id: 'open-ground',
    featureClass: 'class-a-ground',
    label: 'Open ground',
    confirmationPrompt: 'Is there open, level ground you can move on?',
  },
  {
    id: 'walking-running-path',
    featureClass: 'class-a-ground',
    label: 'Path',
    confirmationPrompt: 'Is there a walking or running path?',
  },
  {
    id: 'stairs',
    featureClass: 'class-a-ground',
    label: 'Stairs',
    confirmationPrompt: 'Are there steps or stairs you can use?',
  },
  {
    id: 'hill',
    featureClass: 'class-a-ground',
    label: 'Hill',
    confirmationPrompt: 'Is there a slope or hill you can walk or run up?',
  },
  {
    id: 'running-track',
    featureClass: 'class-a-ground',
    label: 'Running track',
    confirmationPrompt: 'Is there a marked running track?',
  },
  {
    id: 'hard-court',
    featureClass: 'class-a-ground',
    label: 'Hard court',
    confirmationPrompt: 'Is there a hard court surface, such as basketball or tennis?',
  },
  {
    id: 'park-bench',
    featureClass: 'class-b-engineered-load-bearing',
    label: 'Bench',
    confirmationPrompt: 'Is there a standard park bench that is free to use?',
  },
  {
    id: 'pull-up-bar',
    featureClass: 'class-b-engineered-load-bearing',
    label: 'Pull-up bar',
    confirmationPrompt: 'Is there a purpose-built pull-up or horizontal bar?',
  },
  {
    id: 'parallel-bars',
    featureClass: 'class-b-engineered-load-bearing',
    label: 'Parallel bars',
    confirmationPrompt: 'Are there purpose-built parallel or dip bars?',
  },
  {
    id: 'outdoor-fitness-equipment',
    featureClass: 'class-b-engineered-load-bearing',
    label: 'Outdoor fitness equipment',
    confirmationPrompt: 'Is there designated outdoor fitness equipment?',
  },
];

const EXCLUDED: readonly ExcludedObject[] = [
  {
    id: 'playground-frame',
    featureClass: 'class-c-excluded',
    label: 'Playground frame',
    exclusionReason:
      'Supporting bodyweight on play equipment assumes a load path it was not built for.',
  },
  {
    id: 'tree',
    featureClass: 'class-c-excluded',
    label: 'Tree',
    exclusionReason: 'Branch strength cannot be assessed from a photograph or a question.',
  },
  {
    id: 'backstop-fencing',
    featureClass: 'class-c-excluded',
    label: 'Backstop fencing',
    exclusionReason: 'Fencing is not built to be hung from or pushed against.',
  },
  {
    id: 'wall-or-ledge',
    featureClass: 'class-c-excluded',
    label: 'Wall or ledge',
    exclusionReason: 'Height, surface, and stability vary too much to reason about.',
  },
  {
    id: 'doorframe',
    featureClass: 'class-c-excluded',
    label: 'Doorframe',
    exclusionReason: 'Indoor structure outside the park wedge, with unknown fixings.',
  },
  {
    id: 'countertop',
    featureClass: 'class-c-excluded',
    label: 'Countertop',
    exclusionReason: 'Indoor furniture not built to be loaded by a person.',
  },
  {
    id: 'sofa-arm',
    featureClass: 'class-c-excluded',
    label: 'Sofa arm',
    exclusionReason: 'Indoor furniture not built to be loaded by a person.',
  },
  {
    id: 'picnic-table',
    featureClass: 'class-c-excluded',
    label: 'Picnic table',
    exclusionReason: 'Tabletops and benches tip, and construction varies widely.',
  },
  {
    id: 'bleachers',
    featureClass: 'class-c-excluded',
    label: 'Bleachers',
    exclusionReason:
      'Fixed and portable bleachers cannot be reliably distinguished, and portable units move under load.',
    reconsiderWhen:
      'Park audits establish both prevalence and reliable distinguishability. If distinguishability fails, prevalence is irrelevant.',
  },
];

export const FEATURE_REGISTRY: FeatureRegistry = {
  version: '1',
  supported: SUPPORTED,
  excluded: EXCLUDED,
};

const SUPPORTED_IDS: ReadonlySet<string> = new Set(SUPPORTED.map((f) => f.id));

/** Type guard used by the rehydration boundary to validate persisted ids. */
export const isSupportedFeatureId = (value: unknown): value is SupportedFeatureId =>
  typeof value === 'string' && SUPPORTED_IDS.has(value);

export const findSupportedFeature = (id: SupportedFeatureId): SupportedFeature | undefined =>
  SUPPORTED.find((f) => f.id === id);
