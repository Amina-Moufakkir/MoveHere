/**
 * Persistence adapter.
 *
 * Deliberately dumb: it moves strings in and out of a Storage-like object and
 * knows nothing about venue state. It never parses, never validates, and never
 * produces a trusted type — that is the rehydration boundary's job, and keeping
 * parsing out of here is what makes the boundary unskippable.
 */

import type {
  VenueId,
  ReadPersistedInventory,
  WritePersistedInventory,
} from '../domain/confirmation.ts';
import type { StorageLike } from './port.ts';

const keyFor = (venueId: VenueId): string => `movehere:inventory:${venueId}`;

export interface InventoryStore {
  readonly read: ReadPersistedInventory;
  readonly write: WritePersistedInventory;
  readonly clear: (venueId: VenueId) => void;
}

/**
 * Storage can throw — private browsing, quota, disabled cookies. Reads degrade
 * to "no venue", which the confirmation flow already handles: the user is asked
 * to confirm again rather than shown a session built on state we cannot trust.
 */
export const createInventoryStore = (storage: StorageLike): InventoryStore => ({
  read: (venueId) => {
    try {
      return storage.getItem(keyFor(venueId));
    } catch {
      return null;
    }
  },
  write: (venueId, text) => {
    try {
      storage.setItem(keyFor(venueId), text);
    } catch {
      /* Persistence is best-effort; a failed write must not break a session. */
    }
  },
  clear: (venueId) => {
    try {
      storage.removeItem(keyFor(venueId));
    } catch {
      /* ignore */
    }
  },
});
