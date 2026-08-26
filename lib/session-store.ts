/**
 * Web binding for session state.
 *
 * Everything that decides what a session record is, and whether a persisted one
 * can be trusted, lives in src/storage/session-record.ts and is shared with the
 * native client. All that is left here is the choice of where the strings go.
 *
 * One fallback store, not one per call: server rendering has no localStorage,
 * and a fresh memory store on every access would mean nothing ever round-trips.
 */

import { createMemoryStorage } from '../src/storage/port.ts';
import { createSessionStore } from '../src/storage/session-record.ts';

export { SESSION_SCHEMA_VERSION } from '../src/storage/session-record.ts';
export type { ActiveSessionRecord, SessionId } from '../src/storage/session-record.ts';

import type { ActiveSessionRecord } from '../src/storage/session-record.ts';

const fallback = createMemoryStorage();

const store = () =>
  createSessionStore(typeof window === 'undefined' ? fallback : window.localStorage);

export const readSession = (): ActiveSessionRecord | null => store().read();

export const writeSession = (record: ActiveSessionRecord): void => store().write(record);

export const clearSession = (): void => store().clear();
