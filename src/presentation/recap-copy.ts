/**
 * Presenting a completed workout record.
 *
 * Everything here reads the record and the exercise catalog. Nothing calls the
 * generator, reads current inventory, or consults policy — the record already
 * holds what was programmed, and re-deriving any of it would reintroduce the
 * defect §24.3 exists to remove.
 *
 * **Names are current-reference; identity is historical.** The record stores
 * the exercise id, which is the durable fact. The display name comes from
 * today's catalog, because a name is a label for the same movement rather than
 * evidence about the session. Instruction prose and media stay out entirely
 * (§24.5): they are current-reference content and a recap must not imply they
 * were the wording on screen at the time.
 */

import { findSupportedFeature } from '../domain/feature-registry.ts';
import type { SupportedFeatureId } from '../domain/feature.ts';
import type { RecordedMovement } from '../storage/activity-record.ts';

/**
 * What a stored exercise id resolves to today.
 *
 * `retired` is not an error and not a gap. An id that no longer appears in the
 * catalog still happened, so the movement stays in the timeline carrying the
 * identity that was recorded. The alternatives are both worse: dropping it
 * would silently shorten a workout the user performed, and humanising the id
 * into a plausible name would be inventing content to fill the hole.
 */
export type ResolvedMovementName =
  | { readonly kind: 'known'; readonly name: string }
  | { readonly kind: 'retired'; readonly exerciseId: string };

/** Words for the retired case, so both clients say the same thing. */
export const RETIRED_MOVEMENT_NOTE = 'No longer in the movement catalog';

export const resolveMovementName = (
  exerciseId: string,
  lookup: (id: string) => string | null,
): ResolvedMovementName => {
  const name = lookup(exerciseId);
  return name === null || name.length === 0
    ? { kind: 'retired', exerciseId }
    : { kind: 'known', name };
};

/**
 * How a recorded movement names the structure it used.
 *
 * Null feature means the movement was environment-independent, which is a fact
 * about the movement rather than a gap, so it renders nothing at all.
 */
export const featureContextText = (featureId: SupportedFeatureId | null): string | null =>
  featureId === null ? null : `Using the ${findSupportedFeature(featureId)?.label ?? featureId}`;

/**
 * The one line reconciling the record with the correction control beneath it.
 *
 * Both statements on that screen are true and describe different tenses: the
 * workout used the bench, and the bench is now left out of sessions. Without a
 * sentence saying so they read as a contradiction, which is how the audit found
 * them.
 */
export const HISTORY_VS_CORRECTION =
  'This records what the workout used. Corrections change what MoveHere builds next.';

/** One run of movements sharing a block name, in the order they were performed. */
export interface MovementGroup {
  readonly blockName: string;
  readonly movements: readonly RecordedMovement[];
}

/**
 * Groups movements into **contiguous runs** of the same block name.
 *
 * Not by unique name. Grouping by name would merge two separated appearances of
 * the same block into one heading, which silently reorders a workout to tidy up
 * the display — and order is the one thing the record stores by position.
 *
 * Pure, so it is testable without React and shared by both clients.
 */
export const groupByBlock = (movements: readonly RecordedMovement[]): readonly MovementGroup[] => {
  const groups: { blockName: string; movements: RecordedMovement[] }[] = [];
  for (const movement of movements) {
    const last = groups[groups.length - 1];
    if (last !== undefined && last.blockName === movement.blockName) {
      last.movements.push(movement);
    } else {
      groups.push({ blockName: movement.blockName, movements: [movement] });
    }
  }
  return groups;
};
