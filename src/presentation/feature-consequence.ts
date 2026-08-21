/**
 * What trusting a feature would change.
 *
 * Canonical plan: §8 (compatibility), §6 step 3 (confirmation).
 *
 * This is why confirming is not a repeat of selecting: choosing on /park says
 * what is there, and confirmation shows what trusting it will change. The
 * answer is read from the validated matrix, so it is the real one.
 *
 * Shared because it is the basis of a trust decision, not decoration. If the
 * two clients computed this separately they could tell a user that the same
 * bench unlocks different movements, and only one of those answers would have
 * been reviewed. The wording is shared for the same reason: "Adds" and "Would
 * add" is the difference between a consequence and a hypothetical, and a client
 * must not quietly restate one as the other.
 */

import { loadMatrix } from '../domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../domain/exercise-catalog.ts';
import type { SupportedFeatureId } from '../domain/feature.ts';

const matrix = (() => {
  const result = loadMatrix(AUTHORED_MATRIX);
  return result.ok ? result.matrix : null;
})();

/** Movement names a feature makes available, deduplicated and ordered. */
export const movementsUnlockedBy = (featureId: SupportedFeatureId): readonly string[] => {
  if (matrix === null) return [];
  const names = matrix.compatibilities
    .filter((c) => c.featureId === featureId)
    .map((c) => matrix.exercises.find((e) => e.id === c.exerciseId)?.name)
    .filter((n): n is string => n !== undefined);
  return [...new Set(names)].sort();
};

/**
 * How many distinct movements a set of trusted features makes available.
 *
 * Deduplicated across features: two features that unlock the same movement do
 * not make it count twice, because the user is being told what they can do —
 * not how many claims the matrix holds.
 */
export const movementCountFor = (featureIds: readonly SupportedFeatureId[]): number =>
  new Set(featureIds.flatMap((id) => movementsUnlockedBy(id))).size;

/**
 * The consequence line.
 *
 * `trusted` states what confirming has done; the other states what confirming
 * would do. Neither claims the structure is safe to use (§9) — both describe
 * only which movements become eligible.
 */
export const consequenceFor = (
  featureId: SupportedFeatureId,
  trusted: boolean,
): string | null => {
  const unlocks = movementsUnlockedBy(featureId);
  if (unlocks.length === 0) return null;
  return `${trusted ? 'Adds' : 'Would add'} ${unlocks.join(', ')}`;
};
