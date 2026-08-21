/**
 * Minting a generation seed.
 *
 * Provenance, not a user-facing control (§6 step 6). A seed only has to differ
 * between sessions so that asking for another workout produces another workout;
 * nothing downstream reads it for anything but reproducibility.
 *
 * Hermes does not implement crypto.randomUUID, so this takes the clock-derived
 * fallback the web client already carries. Kept in one place because the web
 * client has the same helper in one screen and calls crypto.randomUUID directly
 * in another — a split that works in a browser and would crash here.
 */
export const newSeed = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}`;
