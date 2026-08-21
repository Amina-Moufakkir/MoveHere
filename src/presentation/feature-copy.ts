/**
 * The order features are shown in, and how they are labelled.
 *
 * Deliberately not the registry's order. The registry is ordered by
 * classification — Class A ground types before Class B engineered structures —
 * which is the right order for reasoning about load-bearing assumptions and the
 * wrong order for a person standing in a park. Someone scanning a screen looks
 * for the bench and the bar first; the path and the court are the things they
 * already know are there.
 *
 * Keeping this here means presentation can change without touching the domain,
 * and the domain's ordering can stay meaningful.
 */

import type { SupportedFeatureId } from '../domain/feature.ts';

export const PRESENTATION_ORDER: readonly SupportedFeatureId[] = [
  'park-bench',
  'pull-up-bar',
  'parallel-bars',
  'stairs',
  'hill',
  'walking-running-path',
  'running-track',
  'hard-court',
];

const RANK = new Map(PRESENTATION_ORDER.map((id, index) => [id as string, index]));

/** Anything unranked sorts last, so a new registry entry appears rather than vanishing. */
export const byPresentation = (a: SupportedFeatureId, b: SupportedFeatureId): number =>
  (RANK.get(a) ?? Number.MAX_SAFE_INTEGER) - (RANK.get(b) ?? Number.MAX_SAFE_INTEGER);

/** Short labels and hints for tiles, where the registry's full prompt is too long. */
export const SHORT_LABEL: Record<string, string> = {
  'park-bench': 'Bench',
  'pull-up-bar': 'Pull-up bar',
  'parallel-bars': 'Parallel bars',
  stairs: 'Stairs',
  hill: 'Hill',
  'walking-running-path': 'Path',
  'running-track': 'Track',
  'hard-court': 'Court',
};

export const SHORT_HINT: Record<string, string> = {
  'park-bench': 'Sit or step on it',
  'pull-up-bar': 'Built to hang from',
  'parallel-bars': 'Dip or support bars',
  stairs: 'Steps you can use',
  hill: 'A slope to climb',
  'walking-running-path': 'To walk or run on',
  'running-track': 'A marked loop',
  'hard-court': 'Basketball or tennis',
};
