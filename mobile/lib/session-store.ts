/**
 * Native binding for session state.
 *
 * The mirror of the web client's lib/session-store.ts. What a session record is
 * and whether a persisted one can be trusted live in
 * shared src/storage/session-record.ts.
 */

import { createSessionStore } from '../../src/storage/session-record.ts';
import type { SessionRecord } from '../../src/storage/session-record.ts';
import { nativeStorage } from './storage.ts';

export { SESSION_SCHEMA_VERSION } from '../../src/storage/session-record.ts';
export type { SessionRecord, SessionSummary } from '../../src/storage/session-record.ts';

const store = createSessionStore(nativeStorage);

export const readSession = (): SessionRecord | null => store.read();

export const writeSession = (record: SessionRecord): void => store.write(record);

export const clearSession = (): void => store.clear();
