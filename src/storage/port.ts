/**
 * The storage port both persisted stores are written against.
 *
 * Deliberately the smallest possible slice of the Web Storage API: three
 * synchronous string operations. That shape is what lets the same store run
 * against localStorage in a browser, a synchronous native key-value store on a
 * device, and an in-memory fake in a test, without any of them reaching the
 * domain (§15).
 *
 * Synchronous on purpose. The rehydration boundary and every caller above it
 * are synchronous, so an asynchronous port would not be a swap — it would
 * change the shape of the code that turns untrusted persisted state into
 * trusted venue state, which is the one place that should change least.
 */

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** In-memory implementation for tests and for rendering without a device store. */
export const createMemoryStorage = (): StorageLike => {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => void map.set(key, value),
    removeItem: (key) => void map.delete(key),
  };
};
