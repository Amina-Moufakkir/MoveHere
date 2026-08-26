/**
 * Web binding for Activity history.
 *
 * Everything that decides what a completed record is, and whether a persisted
 * one can be trusted, lives in src/storage and is shared with the native client.
 * All that is left here is the choice of where the strings go.
 *
 * One fallback store, not one per call: server rendering has no localStorage,
 * and a fresh memory store on every access would mean nothing ever round-trips.
 */

import { createMemoryStorage } from '../src/storage/port.ts';
import { createActivityStore } from '../src/storage/activity-store.ts';

export type { ActivityRecord } from '../src/storage/activity-record.ts';
export type { ActivityReadResult, AppendOutcome } from '../src/storage/activity-store.ts';

const fallback = createMemoryStorage();

export const activityStore = () =>
  createActivityStore(typeof window === 'undefined' ? fallback : window.localStorage);
