/**
 * A completed session, as history.
 *
 * **The record is a snapshot, never a derivation** (§24.3). It stores the
 * movements and prescriptions that were actually programmed, so it can be
 * rendered with no call into the generator and no read of current inventory.
 * That property is the whole point: before it, correcting a venue feature after
 * finishing re-derived the finished workout and described it differently.
 *
 * The field list is §24.4 and is deliberately closed. Fields excluded there are
 * excluded here for reasons, not by omission:
 *
 * - **The seed is absent.** With movements stored it would be a second,
 *   contradictable source of truth for the same fact. Deriving the record's
 *   *identifier* from session identity is a different thing and is allowed —
 *   an opaque identity is not a claim about what was trained.
 * - **No venue id or snapshot id.** One venue exists, and Invariant 6 forbids an
 *   attributable home-park relationship in data that may one day leave the
 *   device.
 * - **No generator, matrix or policy versions.** They exist to reproduce
 *   generation; this record reports a stored workout rather than reproducing
 *   one. `authorityTier` carries the only claim §8 obliges us to keep.
 * - **No `wasSubstitute` beside `kind`.** §11 makes these different kinds, not
 *   one kind with a flag, and carrying both invites the two to disagree.
 * - **No instruction prose and no media paths.** Instructional copy and imagery
 *   are current-reference content, not historical evidence of what was on
 *   screen (§24.5).
 * - **No ownership or account fields.** Ownership is assigned by whatever
 *   introduces identity; a null owner today is speculative schema (§24.13).
 *
 * Movement order is array position. There is no index field to disagree with it.
 */

import { SESSION_DURATIONS, SESSION_GOALS } from '../domain/session.ts';
import type { SessionGoal, SessionDuration } from '../domain/session.ts';
import { REPORTED_CONDITIONS } from '../programming/conditions.ts';
import type { ReportedConditions } from '../programming/conditions.ts';
import { isSupportedFeatureId } from '../domain/feature-registry.ts';
import type { SupportedFeatureId } from '../domain/feature.ts';
import type { Prescription, RepCounting } from '../domain/exercise.ts';
import type { SessionId } from './session-record.ts';

export const ACTIVITY_SCHEMA_VERSION = 2;

/** Which tier of content programmed this session (§8). Never upgraded retroactively. */
export type RecordedAuthorityTier = 'project-content' | 'reviewed';

/** A park session and a substitute session are different kinds (§11), not a flag. */
export type RecordedSessionKind = 'park-session' | 'substitute-session';

export type RecordedSubstituteReason =
  | 'conditions-adverse'
  | 'conditions-unavailable'
  | 'no-confirmed-inventory'
  | 'no-compatible-venue-movements';

/**
 * What the user reported for one movement (§25.4).
 *
 * `completed` means **the user marked it Done** — not that MoveHere observed
 * the repetitions, the technique or the load (§25.2, Invariant 10). `skipped`
 * means they explicitly moved past it. `not-reached` means the workout ended
 * before the movement came up.
 *
 * There is no `pending`: pending is a live state, and a finished record has
 * nothing still to do (Invariant 14).
 */
export type MovementResult = 'completed' | 'skipped' | 'not-reached';

export interface RecordedMovement {
  readonly exerciseId: string;
  /** As programmed. Policy may change; what was prescribed may not. */
  readonly prescription: Prescription;
  readonly blockName: string;
  /** The structure this movement relied on, or null when environment-independent. */
  readonly featureId: SupportedFeatureId | null;
  readonly variationLabel?: string;
  readonly result: MovementResult;
}

export interface ActivityRecord {
  readonly recordId: string;
  /**
   * The instant the workout became an immutable Activity record (§25.13).
   *
   * **Not** the workout's start, its elapsed time, or any observed activity
   * time. Renamed from `completedAt`, which stated something false on a record
   * for a workout that was ended early. Orders records exactly.
   */
  readonly recordedAt: string;
  /**
   * The local calendar date at completion, frozen (§24.9, Invariant 4).
   *
   * Not derived at read time. Deriving it later would make history mutable by
   * travel: one timezone eastward and a Sunday-evening session silently becomes
   * Monday's, changing a past week's count.
   */
  readonly localDate: string;
  readonly kind: RecordedSessionKind;
  readonly goal: SessionGoal;
  /** The duration the user chose. Never presented as time trained (§24.11). */
  readonly requestedMinutes: SessionDuration;
  readonly conditions: ReportedConditions;
  readonly substituteReason?: RecordedSubstituteReason;
  readonly featuresUsed: readonly SupportedFeatureId[];
  readonly movements: readonly RecordedMovement[];
  readonly authorityTier: RecordedAuthorityTier;
}

/**
 * The record identifier for a given active session.
 *
 * **Deterministic by contract** (§24.6): repeating terminal completion for the
 * same active session resolves to the same identifier, so an append cannot
 * duplicate. The derivation happens to use the session id because that is the
 * smallest correct implementation; callers must depend on the determinism, not
 * on the shape.
 */
export const recordIdFor = (sessionId: SessionId): string => `r-${sessionId}`;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const DURATIONS: readonly number[] = SESSION_DURATIONS;
const GOALS: readonly string[] = SESSION_GOALS;
const CONDITIONS: readonly string[] = REPORTED_CONDITIONS;
const KINDS: readonly string[] = ['park-session', 'substitute-session'];
const TIERS: readonly string[] = ['project-content', 'reviewed'];
const REASONS: readonly string[] = [
  'conditions-adverse',
  'conditions-unavailable',
  'no-confirmed-inventory',
  'no-compatible-venue-movements',
];
const COUNTING: readonly string[] = ['total', 'per-side'];

/** `YYYY-MM-DD`, and a real date. A frozen date that does not parse is not frozen. */
const isLocalDate = (v: unknown): v is string => {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number) as [number, number, number];
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
};

const parsePrescription = (raw: unknown): Prescription | null => {
  if (!isRecord(raw)) return null;
  const kind = raw['kind'];
  const sets = raw['sets'];
  const counting = raw['counting'];
  const positiveInt = (v: unknown): v is number =>
    typeof v === 'number' && Number.isInteger(v) && v > 0;

  if (kind === 'distance') {
    return positiveInt(raw['meters']) ? { kind: 'distance', meters: raw['meters'] } : null;
  }
  if (!positiveInt(sets)) return null;
  if (typeof counting !== 'string' || !COUNTING.includes(counting)) return null;
  if (kind === 'reps') {
    return positiveInt(raw['reps'])
      ? { kind: 'reps', sets, reps: raw['reps'], counting: counting as RepCounting }
      : null;
  }
  if (kind === 'time') {
    return positiveInt(raw['seconds'])
      ? { kind: 'time', sets, seconds: raw['seconds'], counting: counting as RepCounting }
      : null;
  }
  return null;
};

const RESULTS: readonly string[] = ['completed', 'skipped', 'not-reached'];

const parseMovement = (raw: unknown): RecordedMovement | null => {
  if (!isRecord(raw)) return null;
  const { exerciseId, blockName, featureId, variationLabel, result } = raw;
  if (typeof result !== 'string' || !RESULTS.includes(result)) return null;
  if (typeof exerciseId !== 'string' || exerciseId.length === 0) return null;
  if (typeof blockName !== 'string' || blockName.length === 0) return null;
  const prescription = parsePrescription(raw['prescription']);
  if (prescription === null) return null;

  let feature: SupportedFeatureId | null = null;
  if (featureId !== null && featureId !== undefined) {
    if (!isSupportedFeatureId(featureId)) return null;
    feature = featureId;
  }
  if (variationLabel !== undefined && typeof variationLabel !== 'string') return null;

  return {
    exerciseId,
    prescription,
    blockName,
    featureId: feature,
    ...(typeof variationLabel === 'string' ? { variationLabel } : {}),
    result: result as MovementResult,
  };
};

/**
 * Validates one untrusted persisted record.
 *
 * Per record, deliberately: the store keeps every readable record and
 * quarantines the rest (§24.12, Invariant 6). Returning null here is how a row
 * gets quarantined, not how history gets discarded.
 */
export const parseActivityRecord = (raw: unknown): ActivityRecord | null => {
  if (!isRecord(raw)) return null;
  if (raw['schemaVersion'] !== ACTIVITY_SCHEMA_VERSION) return null;

  const { recordId, recordedAt, localDate, kind, goal, requestedMinutes, conditions } = raw;
  if (typeof recordId !== 'string' || recordId.length === 0) return null;
  if (typeof recordedAt !== 'string' || Number.isNaN(Date.parse(recordedAt))) return null;
  if (!isLocalDate(localDate)) return null;
  if (typeof kind !== 'string' || !KINDS.includes(kind)) return null;
  if (typeof goal !== 'string' || !GOALS.includes(goal)) return null;
  if (typeof requestedMinutes !== 'number' || !DURATIONS.includes(requestedMinutes)) return null;
  if (typeof conditions !== 'string' || !CONDITIONS.includes(conditions)) return null;

  const authorityTier = raw['authorityTier'];
  if (typeof authorityTier !== 'string' || !TIERS.includes(authorityTier)) return null;

  const rawFeatures = raw['featuresUsed'];
  if (!Array.isArray(rawFeatures)) return null;
  const featuresUsed: SupportedFeatureId[] = [];
  for (const f of rawFeatures) {
    if (!isSupportedFeatureId(f)) return null;
    featuresUsed.push(f);
  }

  const rawMovements = raw['movements'];
  if (!Array.isArray(rawMovements) || rawMovements.length === 0) return null;
  const movements: RecordedMovement[] = [];
  for (const m of rawMovements) {
    const parsed = parseMovement(m);
    if (parsed === null) return null;
    movements.push(parsed);
  }

  const substituteReason = raw['substituteReason'];
  let reason: RecordedSubstituteReason | undefined;
  if (substituteReason !== undefined && substituteReason !== null) {
    if (typeof substituteReason !== 'string' || !REASONS.includes(substituteReason)) return null;
    reason = substituteReason as RecordedSubstituteReason;
  }

  /* §11: a park session that used no confirmed feature is a substitute, so a
     park record with no features is not a record we are willing to believe. */
  if (kind === 'park-session' && featuresUsed.length === 0) return null;

  return {
    recordId,
    recordedAt,
    localDate,
    kind: kind as RecordedSessionKind,
    goal: goal as SessionGoal,
    requestedMinutes: requestedMinutes as SessionDuration,
    conditions: conditions as ReportedConditions,
    ...(reason === undefined ? {} : { substituteReason: reason }),
    featuresUsed,
    movements,
    authorityTier: authorityTier as RecordedAuthorityTier,
  };
};

export const toPersistableActivityRecord = (record: ActivityRecord): unknown => ({
  schemaVersion: ACTIVITY_SCHEMA_VERSION,
  ...record,
});

/**
 * Upgrades a stored v1 record to the v2 shape, or refuses.
 *
 * **Every v1 movement becomes `completed`, and this is proved rather than
 * assumed** (§25.14). Under the v1 contract the Activity store had exactly one
 * writer — terminal completion — reached from exactly one call site, gated on a
 * counter that reached the movement total; that counter was incremented from
 * exactly one call site, by one, via the Done action, starting at zero, with no
 * backward navigation. The existence of a v1 record therefore proves the user
 * pressed Done for every movement in it.
 *
 * **`skipped` and `not-reached` are never inferred.** Neither state could be
 * produced under the old contract, so inferring one would be inventing history
 * the implementation made impossible.
 *
 * `completedAt` becomes `recordedAt` with its value unchanged: a v1 record was
 * created only at terminal completion, so the instant it stored was already the
 * instant it became a record. The rename corrects what the field was *called*,
 * not what it held (§25.13).
 *
 * Returns the upgraded row for validation, or null when the row is too damaged
 * to upgrade — in which case it is quarantined like any other unreadable row
 * rather than discarded.
 */
export const migrateActivityV1 = (raw: unknown): unknown => {
  if (!isRecord(raw)) return null;
  if (raw['schemaVersion'] !== 1) return null;

  const movements = raw['movements'];
  if (!Array.isArray(movements)) return null;

  const { completedAt, ...rest } = raw;
  if (typeof completedAt !== 'string') return null;

  return {
    ...rest,
    schemaVersion: ACTIVITY_SCHEMA_VERSION,
    recordedAt: completedAt,
    movements: movements.map((m) =>
      isRecord(m) ? { ...m, result: 'completed' satisfies MovementResult } : m,
    ),
  };
};
