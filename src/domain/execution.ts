/**
 * What the user reported doing, movement by movement.
 *
 * **The scalar this replaces carried two facts at once** — where the user was,
 * and what they had performed — and every situation the product could not
 * express followed from that fusion (§25.1). Skipping must advance position
 * without adding evidence; ending early must stop both while keeping the
 * evidence already gathered. Neither is expressible in a number that means both.
 *
 * So execution is an **ordered prefix of resolved results**. Position is not
 * stored: it *is* the prefix length. Nothing can drift out of step with
 * anything else, because there is only one fact.
 *
 * **`pending` is never persisted.** Every movement beyond the prefix is pending
 * by definition, which is why the array needs no total and no padding.
 *
 * This encodes one constraint deliberately: **resolution is forward-only.**
 * Returning to an earlier movement is not authorized in Session Execution v2
 * (§25.15), and this representation is what would have to change if it ever is.
 *
 * Every function here is pure and total. Execution state is a domain concern,
 * not something React components should be mutating between them (§25).
 */

/** What a resolved movement records. Never `pending` — see above. */
export type MovementResolution = 'completed' | 'skipped';

/** The ordered prefix. Index *i* is the result of generated movement *i*. */
export type ExecutionPrefix = readonly MovementResolution[];

export const EMPTY_EXECUTION: ExecutionPrefix = [];

const RESOLUTIONS: readonly string[] = ['completed', 'skipped'];

export const isMovementResolution = (v: unknown): v is MovementResolution =>
  typeof v === 'string' && RESOLUTIONS.includes(v);

/**
 * The movement the user is on: the first unresolved one.
 *
 * Equal to the prefix length by construction. Stated as a function anyway, so
 * that callers depend on the *meaning* rather than on the representation — if
 * the representation ever changes, this is the only place that knows.
 */
export const currentIndex = (execution: ExecutionPrefix): number => execution.length;

export const resolvedCount = (execution: ExecutionPrefix): number => execution.length;

export const completedCount = (execution: ExecutionPrefix): number =>
  execution.filter((r) => r === 'completed').length;

export const skippedCount = (execution: ExecutionPrefix): number =>
  execution.filter((r) => r === 'skipped').length;

/** How many movements remain untouched. Needs the total, which execution never stores. */
export const pendingCount = (execution: ExecutionPrefix, total: number): number =>
  Math.max(total - execution.length, 0);

/**
 * Whether the workout reached its programmed end.
 *
 * **Finished does not mean everything was completed** (§25.5, Invariant 11).
 * Five completed plus two skipped is finished, and must never be summarised as
 * seven completed. This asks only whether anything is still pending.
 */
export const isFinished = (execution: ExecutionPrefix, total: number): boolean =>
  total > 0 && execution.length >= total;

/**
 * Whether any evidence exists that the user did something.
 *
 * A workout that was generated and never begun is not a workout (§25.9). This
 * is the predicate the zero-evidence rule turns on.
 */
export const hasExecutionEvidence = (execution: ExecutionPrefix): boolean =>
  execution.length > 0;

/** Marks the current movement completed and advances. Refuses to run past the end. */
export const markDone = (execution: ExecutionPrefix, total: number): ExecutionPrefix =>
  execution.length >= total ? execution : [...execution, 'completed'];

/**
 * Marks the current movement skipped and advances.
 *
 * Skipping is a normal part of training, not a failure and not an absence: the
 * user made a decision and the record keeps it (§25.7). It never counts as
 * completed.
 */
export const markSkipped = (execution: ExecutionPrefix, total: number): ExecutionPrefix =>
  execution.length >= total ? execution : [...execution, 'skipped'];

/**
 * Clears execution evidence, leaving the workout itself untouched.
 *
 * Restart is *the same workout again* — same seed, same frozen input, same
 * movements and prescriptions (§25.10). Only what the user reported is reset,
 * which is why it needs confirmation in the interface even though it is trivial
 * here.
 */
export const restartExecution = (): ExecutionPrefix => EMPTY_EXECUTION;

/**
 * Validates a persisted prefix against the workout it claims to describe.
 *
 * Fails closed and **never truncates or pads** (§25.15). Execution evidence that
 * does not fit the workout is evidence about some other workout, and silently
 * reshaping it would be inventing a session the user never performed.
 */
export const parseExecution = (raw: unknown, total: number): ExecutionPrefix | null => {
  if (!Array.isArray(raw)) return null;
  if (raw.length > total) return null;
  const out: MovementResolution[] = [];
  for (const entry of raw) {
    if (!isMovementResolution(entry)) return null;
    out.push(entry);
  }
  return out;
};
