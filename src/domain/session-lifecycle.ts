/**
 * The lifecycle decisions, as functions of state.
 *
 * These are product rules, not UI behaviour, so they live in shared source and
 * are testable without React (§15). Both clients must refuse a replacement on
 * the same evidence; a rule re-implemented per client is a rule that will
 * diverge, and the divergence would be a silently destroyed workout.
 */

import type { ActiveSessionRecord } from '../storage/session-record.ts';
import { hasExecutionEvidence, isFinished as executionFinished } from './execution.ts';

/**
 * Whether a new session may begin.
 *
 * `refused` is not an error: it reports that unfinished work exists, so the
 * caller must offer a choice rather than act on an assumption (§24.6,
 * Invariant 7). There is deliberately no force parameter — destruction is a
 * separate named operation, not a flag on this one.
 */
export type BeginDecision =
  | { readonly kind: 'begin' }
  | { readonly kind: 'refused'; readonly reason: 'unfinished-session-exists' };

export const decideBegin = (existing: ActiveSessionRecord | null): BeginDecision =>
  existing === null
    ? { kind: 'begin' }
    : { kind: 'refused', reason: 'unfinished-session-exists' };

/**
 * What to do with a persisted session found at startup.
 *
 * `reconcile` is the append-before-clear recovery window (§24.6): a record
 * already exists for this session's identity, so completion happened and only
 * the clear was interrupted. The session is cleared rather than restored, so
 * the user is never handed a finished session to finish again — and because the
 * record identity is deterministic, nothing can be appended twice.
 */
export type StartupDecision =
  | { readonly kind: 'none' }
  | { readonly kind: 'restore' }
  | { readonly kind: 'reconcile' };

export const decideStartup = (
  existing: ActiveSessionRecord | null,
  completedRecordExists: boolean,
): StartupDecision => {
  if (existing === null) return { kind: 'none' };
  return completedRecordExists ? { kind: 'reconcile' } : { kind: 'restore' };
};

/** Whether the session has reached its final movement. */
export const isFinished = (session: ActiveSessionRecord, total: number): boolean =>
  executionFinished(session.execution, total);

/**
 * Whether ending the workout now would record anything.
 *
 * `no-evidence` is not an error and not a refusal to act — it reports that the
 * workout was generated and never begun, which is not a workout (§25.9,
 * Invariant 13). The domain says so explicitly rather than quietly discarding
 * the session, because what the user should be offered instead is an interface
 * decision and this layer must not make it for them.
 */
export type EndDecision =
  | { readonly kind: 'record' }
  | { readonly kind: 'no-evidence' };

export const decideEnd = (session: ActiveSessionRecord): EndDecision =>
  hasExecutionEvidence(session.execution) ? { kind: 'record' } : { kind: 'no-evidence' };
