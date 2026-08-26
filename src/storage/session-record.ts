/**
 * The active session: unfinished work, and nothing else.
 *
 * **This store represents unfinished work only** (§24.3, §24.6). A completed
 * session is not a session with a flag set on it — it is an immutable Activity
 * record in a different store with a different lifetime. `completedAt` and
 * `summary` used to live here, and while they did, a finished session could be
 * finished again: the audit found re-completion rewriting which feature a
 * session had been attributed to. Removing the state is what makes that
 * impossible; validating around it would only have made it harder.
 *
 * The generated session is still never stored. It is regenerated from the seed
 * and the **frozen generation view** this record carries, which is what makes
 * resume faithful rather than merely equivalent: confirming or correcting a
 * feature mid-session changes the next session and cannot reach this one
 * (§24.6). Before the view was frozen, "same seed" did not mean "same workout".
 *
 * Reads validate and fail closed, like the venue boundary: unreadable session
 * state is no session, not a half-restored one.
 *
 * Shared by both clients (§15). What counts as a readable session is a product
 * decision, not a platform one. Only the StorageLike handed in differs.
 */

import { SESSION_DURATIONS, SESSION_GOALS } from '../domain/session.ts';
import type { SessionGoal, SessionDuration } from '../domain/session.ts';
import { REPORTED_CONDITIONS } from '../programming/conditions.ts';
import type { ReportedConditions } from '../programming/conditions.ts';
import { rehydrateGenerationView } from '../domain/confirmation.ts';
import type { GenerationVenueView } from '../domain/confirmation.ts';
import type { SupportedFeatureId } from '../domain/feature.ts';
import type { StorageLike } from './port.ts';

/**
 * Bump when the persisted shape changes. Reads refuse other versions.
 *
 * v2 removed `completedAt`/`summary` and added `sessionId` and the frozen
 * generation view. v1 records are migrated where that can be done faithfully
 * and refused where it cannot — see `migrateSession`.
 */
export const SESSION_SCHEMA_VERSION = 2;

const KEY = 'movehere:session';

/**
 * Stable identity of one attempt at a workout.
 *
 * Distinct from the seed on purpose. The seed is generator machinery; this is
 * the identity a completed Activity record derives its own identifier from
 * (§24.4, §24.6), which is what makes repeating terminal completion resolve to
 * the same record instead of appending another.
 */
export type SessionId = string;

export interface ActiveSessionRecord {
  readonly sessionId: SessionId;
  readonly seed: string;
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
  /** How many items the user has ticked off. Never equal to the total: that is completion. */
  readonly done: number;
  /**
   * The venue view this session was generated from, frozen at creation.
   *
   * Null means the session was generated with no usable venue — an
   * environment-independent or substitute session — which is a different fact
   * from "the frozen input could not be read".
   */
  readonly frozenView: GenerationVenueView | null;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Validation reads the canonical sets rather than restating them.
 *
 * Restating the durations put the fixed set in two places, and the plan makes
 * changing that set a product decision (§6 step 4) — the kind of change that
 * must not half-apply because a rehydration guard was missed.
 */
const DURATIONS: readonly number[] = SESSION_DURATIONS;
const GOALS: readonly string[] = SESSION_GOALS;
const CONDITIONS: readonly string[] = REPORTED_CONDITIONS;

interface CommonFields {
  readonly seed: string;
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
  readonly done: number;
}

/** The fields v1 and v2 share, validated once. */
const parseCommon = (raw: Record<string, unknown>): CommonFields | null => {
  const { seed, minutes, goal, conditions, done } = raw;
  if (typeof seed !== 'string' || seed.length === 0) return null;
  if (typeof minutes !== 'number' || !DURATIONS.includes(minutes)) return null;
  if (typeof goal !== 'string' || !GOALS.includes(goal)) return null;
  if (typeof conditions !== 'string' || !CONDITIONS.includes(conditions)) return null;
  if (typeof done !== 'number' || !Number.isInteger(done) || done < 0) return null;
  return {
    seed,
    minutes: minutes as SessionDuration,
    goal: goal as SessionGoal,
    conditions: conditions as ReportedConditions,
    done,
  };
};

/**
 * What a v1 record becomes.
 *
 * `migrated` carries a faithful unfinished session. `dropped` means the record
 * was readable but must not be carried forward, and says why — a completed v1
 * session cannot become an Activity record, because v1 never stored the
 * movements and reconstructing them would mean generating a workout from
 * *today's* inventory and presenting it as history (§24.3). That is fabrication,
 * and it is the one thing the migration must refuse to do.
 */
export type SessionMigration =
  | { readonly kind: 'migrated'; readonly record: ActiveSessionRecord }
  | { readonly kind: 'dropped'; readonly reason: 'completed-v1' | 'unreadable' };

/**
 * Migrates a v1 record, or refuses.
 *
 * An unfinished v1 session migrates: its seed, request and position are all
 * still meaningful. It has no frozen view — v1 did not have the concept — so it
 * migrates with `frozenView: null`, and generation falls back to live inventory
 * for that one legacy session. That is exactly the behaviour it already had, so
 * migration changes nothing for it and invents nothing.
 *
 * `sessionId` is derived from the v1 seed rather than minted, so migrating the
 * same record twice yields the same identity.
 */
export const migrateSessionV1 = (raw: Record<string, unknown>): SessionMigration => {
  if (raw['completedAt'] !== null && raw['completedAt'] !== undefined) {
    return { kind: 'dropped', reason: 'completed-v1' };
  }
  const common = parseCommon(raw);
  if (common === null) return { kind: 'dropped', reason: 'unreadable' };
  return {
    kind: 'migrated',
    record: { sessionId: `v1-${common.seed}`, ...common, frozenView: null },
  };
};

/** JSON.parse lives here and nowhere else for session state. */
export const parseSessionRecord = (text: string): ActiveSessionRecord | null => {
  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    return null;
  }
  if (!isRecord(raw)) return null;

  if (raw['schemaVersion'] === 1) {
    const migration = migrateSessionV1(raw);
    return migration.kind === 'migrated' ? migration.record : null;
  }
  if (raw['schemaVersion'] !== SESSION_SCHEMA_VERSION) return null;

  const common = parseCommon(raw);
  if (common === null) return null;

  const { sessionId, frozenView } = raw;
  if (typeof sessionId !== 'string' || sessionId.length === 0) return null;

  /* Absent and unreadable are different. Absent means the session genuinely had
     no usable venue; unreadable means the frozen input cannot be trusted, and a
     session that cannot be faithfully resumed is not restored at all. */
  let view: GenerationVenueView | null = null;
  if (frozenView !== null && frozenView !== undefined) {
    view = rehydrateGenerationView(frozenView);
    if (view === null) return null;
  }

  return { sessionId, ...common, frozenView: view };
};

/** Serializes for storage. The schema version leads, so a read can refuse early. */
export const toPersistableSession = (record: ActiveSessionRecord): string =>
  JSON.stringify({
    schemaVersion: SESSION_SCHEMA_VERSION,
    sessionId: record.sessionId,
    seed: record.seed,
    minutes: record.minutes,
    goal: record.goal,
    conditions: record.conditions,
    done: record.done,
    /* Only the ids cross the boundary. The brand is reconstructed on read by the
       module that owns it, never carried through JSON. */
    frozenView:
      record.frozenView === null ? null : ([...record.frozenView.usableFeatures] as SupportedFeatureId[]),
  });

export interface SessionStore {
  readonly read: () => ActiveSessionRecord | null;
  readonly write: (record: ActiveSessionRecord) => void;
  readonly clear: () => void;
}

/**
 * Storage can throw — private browsing, quota, a device store that is not
 * ready. Reads degrade to "no session", which the flow already handles by
 * offering to set one up, rather than restoring half of one.
 */
export const createSessionStore = (storage: StorageLike): SessionStore => ({
  read: () => {
    let text: string | null = null;
    try {
      text = storage.getItem(KEY);
    } catch {
      return null;
    }
    return text === null ? null : parseSessionRecord(text);
  },
  write: (record) => {
    try {
      storage.setItem(KEY, toPersistableSession(record));
    } catch {
      /* Persistence is best-effort; a failed write must not break a session. */
    }
  },
  clear: () => {
    try {
      storage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
});
