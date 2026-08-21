/**
 * The native storage port implementation. This is the whole platform layer.
 *
 * expo-sqlite/kv-store's synchronous API satisfies StorageLike as written, so
 * nothing above this file learns which platform it is on. That is the point:
 * confirmed venue state is produced by the same constructor and validated by
 * the same rehydration boundary on a device as in a browser.
 *
 * Synchronous is load-bearing, not incidental. StorageLike and every caller
 * above it are synchronous; an async store would not be a swap, it would
 * reshape the code that turns untrusted persisted state into trusted venue
 * state. Proven on device — see docs/native-client-spike.md.
 *
 * No validation, no parsing, no trust decisions. Those live in shared src/ and
 * may not move here. If this file ever needs to know what a venue is,
 * something has gone wrong.
 */

import Storage from 'expo-sqlite/kv-store';
import type { StorageLike } from '../../src/storage/port.ts';

export const nativeStorage: StorageLike = {
  getItem: (key) => Storage.getItemSync(key),
  setItem: (key, value) => Storage.setItemSync(key, value),
  removeItem: (key) => {
    Storage.removeItemSync(key);
  },
};
