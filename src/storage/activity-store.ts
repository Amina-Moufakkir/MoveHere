/**
 * Local Activity history.
 *
 * Append-only, on the device, under its own key. Separate from the active
 * session (§24.3): mixing mutable in-flight state with immutable history in one
 * key means every tick of a workout rewrites the whole history.
 *
 * **Per-record validation with quarantine** (§24.12, Invariant 6). This is a
 * deliberate, documented divergence from the venue boundary's fail-closed rule.
 * The venue boundary fails closed because a half-restored inventory could imply
 * a confirmation the user never gave, which is a safety claim. History carries
 * no safety semantics, and whole-store fail-closed would let one malformed row
 * erase a year of records. Invalid rows are skipped and counted; valid ones are
 * kept. A future maintainer restoring "consistency" with the neighbouring store
 * would be removing this on purpose, which is why it is written down.
 *
 * **Migration before discard.** The session store may refuse an unrecognised
 * version because a session is regenerable. History is not, so an unreadable
 * envelope is reported rather than silently replaced.
 *
 * localStorage, not IndexedDB (§24.12): a record of roughly seven movements
 * serialises to well under a kilobyte, the port is three synchronous string
 * operations by design, and an asynchronous store would change the shape of
 * every rehydration boundary above it.
 */

import {
  parseActivityRecord,
  toPersistableActivityRecord,
  migrateActivityV1,
  ACTIVITY_SCHEMA_VERSION,
} from './activity-record.ts';
import type { ActivityRecord } from './activity-record.ts';
import type { StorageLike } from './port.ts';

const KEY = 'movehere:activity';

/**
 * What a read found.
 *
 * `quarantined` is a count, not a silence. A store that drops rows without
 * saying so is indistinguishable from one that never had them.
 */
export interface ActivityReadResult {
  readonly records: readonly ActivityRecord[];
  readonly quarantined: number;
  /** True when the envelope itself was unreadable, as opposed to rows inside it. */
  readonly envelopeUnreadable: boolean;
  /**
   * Rows that could not be parsed, exactly as stored.
   *
   * Kept so that a write cannot destroy them. Quarantine means "we cannot read
   * this", not "this may be thrown away": history is not regenerable, and a
   * later schema may rescue what today's parser cannot (§24.12,
   * migration-before-discard). Deleting one workout must not silently take an
   * unrelated unreadable row with it.
   */
  readonly unreadable: readonly unknown[];
}

/** Whether an append added anything. A duplicate is a success, not an error. */
export type AppendOutcome = 'appended' | 'duplicate';

export interface ActivityStore {
  readonly read: () => ActivityReadResult;
  /** Newest first. */
  readonly list: () => readonly ActivityRecord[];
  readonly findById: (recordId: string) => ActivityRecord | null;
  readonly has: (recordId: string) => boolean;
  readonly append: (record: ActivityRecord) => AppendOutcome;
  readonly remove: (recordId: string) => boolean;
}

const EMPTY: ActivityReadResult = {
  records: [],
  quarantined: 0,
  envelopeUnreadable: false,
  unreadable: [],
};

/** Newest first, with record id as a stable tiebreak so equal instants do not reorder. */
const byNewest = (a: ActivityRecord, b: ActivityRecord): number => {
  if (a.recordedAt !== b.recordedAt) return a.recordedAt < b.recordedAt ? 1 : -1;
  return a.recordId < b.recordId ? 1 : -1;
};

export const createActivityStore = (storage: StorageLike): ActivityStore => {
  const readRaw = (): ActivityReadResult => {
    let text: string | null = null;
    try {
      text = storage.getItem(KEY);
    } catch {
      return EMPTY;
    }
    if (text === null) return EMPTY;

    const broken = (): ActivityReadResult => ({
      records: [],
      quarantined: 0,
      envelopeUnreadable: true,
      unreadable: [],
    });

    let raw: unknown;
    try {
      raw = JSON.parse(text) as unknown;
    } catch {
      return broken();
    }
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return broken();
    const envelope = raw as Record<string, unknown>;

    const version = envelope['schemaVersion'];
    /* Migration before discard (§24.12). v1 rows are upgraded on read rather
       than refused: history is not regenerable, and a version bump is not a
       reason to lose it. An unrecognised version still reports rather than
       overwriting. */
    if (version !== ACTIVITY_SCHEMA_VERSION && version !== 1) return broken();
    const rows = envelope['records'];
    if (!Array.isArray(rows)) return broken();

    const records: ActivityRecord[] = [];
    const unreadable: unknown[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const candidate = version === 1 ? migrateActivityV1(row) : row;
      const parsed = candidate === null ? null : parseActivityRecord(candidate);
      if (parsed === null || seen.has(parsed.recordId)) {
        unreadable.push(row);
        continue;
      }
      seen.add(parsed.recordId);
      records.push(parsed);
    }
    return { records, quarantined: unreadable.length, envelopeUnreadable: false, unreadable };
  };

  const writeAll = (records: readonly ActivityRecord[], unreadable: readonly unknown[]): void => {
    try {
      storage.setItem(
        KEY,
        JSON.stringify({
          schemaVersion: ACTIVITY_SCHEMA_VERSION,
          /* Unreadable rows ride along untouched. Rewriting without them would
             make every append and every deletion a silent purge of data nobody
             chose to remove. */
          records: [...records.map(toPersistableActivityRecord), ...unreadable],
        }),
      );
    } catch {
      /* Best-effort, like every other write here. A failed write must not throw
         into a completion the user has already performed. */
    }
  };

  const store: ActivityStore = {
    read: readRaw,
    list: () => [...readRaw().records].sort(byNewest),
    findById: (recordId) => readRaw().records.find((r) => r.recordId === recordId) ?? null,
    has: (recordId) => readRaw().records.some((r) => r.recordId === recordId),
    append: (record) => {
      const current = readRaw();
      /* Idempotent by record identity (§24.6). A double activation, a reload
         mid-completion, or a retry after an interrupted clear all resolve to the
         same identifier and must not append a second record. */
      if (current.records.some((r) => r.recordId === record.recordId)) return 'duplicate';
      writeAll([...current.records, record], current.unreadable);
      return 'appended';
    },
    remove: (recordId) => {
      const current = readRaw();
      const next = current.records.filter((r) => r.recordId !== recordId);
      if (next.length === current.records.length) return false;
      writeAll(next, current.unreadable);
      return true;
    },
  };
  return store;
};
