/**
 * Which completed record a recap is showing.
 *
 * The rule that matters: **an explicitly requested record never silently
 * resolves to a different workout.** If someone asks for a specific completed
 * session and it cannot be read, the honest answer is that it cannot be read.
 * Falling back to the newest record would show them a real workout under a
 * request for another one — every fact on screen true, and the whole screen a
 * lie about which session it describes.
 *
 * `no-records` and `requested-unavailable` are therefore different states with
 * different words, not one empty state serving both.
 */

import type { ActivityRecord } from '../storage/activity-record.ts';

export type RecapSelection =
  | { readonly kind: 'record'; readonly record: ActivityRecord }
  /** Nothing has ever been completed, or history is empty. */
  | { readonly kind: 'no-records' }
  /** A specific record was asked for and is not readable — quarantined, deleted, or never existed. */
  | { readonly kind: 'requested-unavailable'; readonly recordId: string };

/**
 * @param records Readable records, newest first.
 * @param requestedId The record explicitly asked for, or null for "the newest".
 */
export const selectRecap = (
  records: readonly ActivityRecord[],
  requestedId: string | null,
): RecapSelection => {
  if (requestedId !== null && requestedId.length > 0) {
    const found = records.find((r) => r.recordId === requestedId);
    return found === undefined
      ? { kind: 'requested-unavailable', recordId: requestedId }
      : { kind: 'record', record: found };
  }
  const newest = records[0];
  return newest === undefined ? { kind: 'no-records' } : { kind: 'record', record: newest };
};
