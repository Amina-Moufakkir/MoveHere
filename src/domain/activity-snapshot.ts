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
import type { ExecutionPrefix } from './execution.ts';

export interface CompletionStamp {
  /** UTC instant at which the record is being created (§25.13). */
  readonly at: string;
  /** The local calendar date as the user experienced it, frozen here (§24.9). */
  readonly localDate: string;
}

/**
 * Flattens blocks to movements, attaching what the user reported for each.
 *
 * The execution prefix is positional, so movement *i* takes result *i*.
 * **Anything past the prefix is `not-reached`** — the workout ended before it
 * came up (§25.4). Every programmed movement is kept whatever its result:
 * dropping a skipped or unreached one would shorten a workout somebody
 * performed (Invariant 12).
 */
const movementsOf = (
  blocks: Extract<SessionGenerationOutput, { kind: 'park-session' }>['blocks'],
  execution: ExecutionPrefix,
): RecordedMovement[] => {
  let position = -1;
  return blocks.flatMap((block) =>
    block.items.map<RecordedMovement>((item) => {
      position += 1;
      const resolved = execution[position];
      return {
        exerciseId: String(item.exerciseId),
        prescription: item.prescription,
        blockName: block.name,
        featureId:
          item.basis.kind === 'confirmed-feature'
            ? (item.basis.featureId as SupportedFeatureId)
            : null,
        ...(item.variationLabel === undefined ? {} : { variationLabel: item.variationLabel }),
        result: resolved ?? 'not-reached',
      };
    }),
  );
};

/**
 * Builds the immutable record for a session that has just ended.
 *
 * **One builder for both terminal paths** (§25.15). A finished workout and one
 * ended early differ only in whether any movement was left unresolved, so they
 * differ only in the results attached here — not in how the record is made. The
 * outcome is derived from those results and never stored (§25.5).
 *
 * Returns null when the session produced no workout to record. A session that
 * could not be generated has nothing to describe, and inventing a record for it
 * would be the fabrication §24.3 exists to prevent.
 *
 * The caller is responsible for the zero-evidence rule (§25.9): this builder
 * describes whatever it is given, and refusing to record is a lifecycle
 * decision made above it.
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
    recordedAt: stamp.at,
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
      movements: movementsOf(workout.blocks, session.execution),
    };
  }

  return {
    ...common,
    kind: 'substitute-session',
    substituteReason: workout.reason.kind as RecordedSubstituteReason,
    /* A substitute session used no confirmed feature. That is what makes it a
       substitute (§11), so the empty list is a fact rather than a gap. */
    featuresUsed: [],
    movements: movementsOf(workout.blocks, session.execution),
  };
};
