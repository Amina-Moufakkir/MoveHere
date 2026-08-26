/**
 * Turning a finished session into history.
 *
 * This is the only place a completed-session record is constructed. It reads a
 * generated session and the active session that produced it, and writes down
 * what was programmed — movements, order, prescriptions, the feature each one
 * relied on. Nothing here reads current inventory, and nothing downstream needs
 * the generator again (§24.3).
 *
 * **Order is array position.** The blocks are flattened in the order they were
 * presented, which is the order they were performed in.
 *
 * The clock is supplied, never read. Both the completion instant and the frozen
 * local date come from the caller, exactly as the confirmation boundary
 * requires a caller-supplied timestamp — shared source that quietly read a
 * clock would be a hidden dependency in the same tree as the deterministic
 * generator.
 */

import type { SessionGenerationOutput } from './session.ts';
import type { SupportedFeatureId } from './feature.ts';
import { recordIdFor } from '../storage/activity-record.ts';
import type {
  ActivityRecord,
  RecordedAuthorityTier,
  RecordedMovement,
  RecordedSubstituteReason,
} from '../storage/activity-record.ts';
import type { ActiveSessionRecord } from '../storage/session-record.ts';

export interface CompletionStamp {
  /** UTC instant of completion. */
  readonly at: string;
  /** The local calendar date as the user experienced it, frozen here (§24.9). */
  readonly localDate: string;
}

/** Flattens blocks to movements, preserving presentation order. */
const movementsOf = (
  blocks: Extract<SessionGenerationOutput, { kind: 'park-session' }>['blocks'],
): RecordedMovement[] =>
  blocks.flatMap((block) =>
    block.items.map<RecordedMovement>((item) => ({
      exerciseId: String(item.exerciseId),
      prescription: item.prescription,
      blockName: block.name,
      featureId:
        item.basis.kind === 'confirmed-feature'
          ? (item.basis.featureId as SupportedFeatureId)
          : null,
      ...(item.variationLabel === undefined ? {} : { variationLabel: item.variationLabel }),
    })),
  );

/**
 * Builds the immutable record for a session that has just been completed.
 *
 * Returns null when the session produced no workout to record. A session that
 * could not be generated has nothing to describe, and inventing a record for it
 * would be the fabrication §24.3 exists to prevent.
 */
export const buildActivityRecord = (
  session: ActiveSessionRecord,
  workout: SessionGenerationOutput,
  stamp: CompletionStamp,
): ActivityRecord | null => {
  if (workout.kind === 'not-generated') return null;

  const authorityTier = workout.provenance.authorityTier as RecordedAuthorityTier;
  const common = {
    recordId: recordIdFor(session.sessionId),
    completedAt: stamp.at,
    localDate: stamp.localDate,
    goal: session.goal,
    requestedMinutes: session.minutes,
    conditions: session.conditions,
    authorityTier,
  };

  if (workout.kind === 'park-session') {
    return {
      ...common,
      kind: 'park-session',
      featuresUsed: [...workout.featuresUsed],
      movements: movementsOf(workout.blocks),
    };
  }

  return {
    ...common,
    kind: 'substitute-session',
    substituteReason: workout.reason.kind as RecordedSubstituteReason,
    /* A substitute session used no confirmed feature. That is what makes it a
       substitute (§11), so the empty list is a fact rather than a gap. */
    featuresUsed: [],
    movements: movementsOf(workout.blocks),
  };
};
