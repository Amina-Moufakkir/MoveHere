/**
 * Local session state: the seed, the request behind it, progress, completion.
 *
 * The session itself is never stored. It is regenerated from the seed and the
 * confirmed inventory, which is what makes a reload return the same workout
 * rather than a plausible-looking different one. Storing the output would also
 * mean storing something that could drift from the content that produced it.
 *
 * Reads validate and fail closed, like the venue boundary: unreadable session
 * state is no session, not a half-restored one.
 */

import { createMemoryStorage } from '../src/storage/inventory-store.ts';
import type { SessionGoal, SessionDuration } from '../src/domain/session.ts';

export const SESSION_SCHEMA_VERSION = 1;
const KEY = 'movehere:session';

export type ReportedConditions = 'acceptable' | 'adverse' | 'unknown';

/**
 * What a finished session was, captured at the moment it finished.
 *
 * A completed session is a record, not a derivation. Without this, correcting a
 * feature afterwards would rewrite history: the workout you just did would
 * re-derive from the corrected inventory and describe itself differently.
 */
export interface SessionSummary {
  readonly movements: number;
  readonly featuresUsed: readonly string[];
  readonly wasSubstitute: boolean;
}

export interface SessionRecord {
  readonly seed: string;
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
  /** How many items the user has ticked off. */
  readonly done: number;
  readonly completedAt: string | null;
  readonly summary: SessionSummary | null;
}

const fallback = createMemoryStorage();
const storage = () => (typeof window === 'undefined' ? fallback : window.localStorage);

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const DURATIONS: readonly number[] = [10, 20, 30, 45];
const GOALS: readonly string[] = ['strength', 'conditioning'];
const CONDITIONS: readonly string[] = ['acceptable', 'adverse', 'unknown'];

/** JSON.parse lives here and nowhere else for session state. */
export const readSession = (): SessionRecord | null => {
  let text: string | null = null;
  try {
    text = storage().getItem(KEY);
  } catch {
    return null;
  }
  if (text === null) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(raw)) return null;
  if (raw['schemaVersion'] !== SESSION_SCHEMA_VERSION) return null;

  const { seed, minutes, goal, conditions, done, completedAt, summary } = raw;
  if (typeof seed !== 'string' || seed.length === 0) return null;
  if (typeof minutes !== 'number' || !DURATIONS.includes(minutes)) return null;
  if (typeof goal !== 'string' || !GOALS.includes(goal)) return null;
  if (typeof conditions !== 'string' || !CONDITIONS.includes(conditions)) return null;
  if (typeof done !== 'number' || !Number.isInteger(done) || done < 0) return null;
  if (completedAt !== null && typeof completedAt !== 'string') return null;

  let parsedSummary: SessionSummary | null = null;
  if (summary !== undefined && summary !== null) {
    if (!isRecord(summary)) return null;
    const { movements, featuresUsed, wasSubstitute } = summary;
    if (typeof movements !== 'number' || !Number.isInteger(movements) || movements < 0) return null;
    if (!Array.isArray(featuresUsed) || featuresUsed.some((f) => typeof f !== 'string')) return null;
    if (typeof wasSubstitute !== 'boolean') return null;
    parsedSummary = { movements, featuresUsed: featuresUsed as string[], wasSubstitute };
  }

  return {
    seed,
    minutes: minutes as SessionDuration,
    goal: goal as SessionGoal,
    conditions: conditions as ReportedConditions,
    done,
    completedAt,
    summary: parsedSummary,
  };
};

export const writeSession = (record: SessionRecord): void => {
  try {
    storage().setItem(KEY, JSON.stringify({ schemaVersion: SESSION_SCHEMA_VERSION, ...record }));
  } catch {
    /* Persistence is best-effort; a failed write must not break a session. */
  }
};

export const clearSession = (): void => {
  try {
    storage().removeItem(KEY);
  } catch {
    /* ignore */
  }
};
