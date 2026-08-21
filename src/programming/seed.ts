/**
 * Minting a generation seed.
 *
 * Canonical plan: §6 step 6. A seed is provenance, not a user-facing control.
 * The whole requirement is: produce a sufficiently varying opaque string, so
 * that asking for another session produces another session and any session
 * remains reproducible from what was recorded.
 *
 * That requirement is not platform-specific, so neither is this. Both clients
 * had been satisfying it differently — the web reached for crypto.randomUUID in
 * one screen and a clock fallback in another, and the native client needed a
 * third path because Hermes implements neither.
 *
 * **No clock and no randomness inside this module.** The caller supplies the
 * time, exactly as the confirmation boundary requires a caller-supplied
 * timestamp. Shared source that quietly read a clock would be a hidden
 * dependency in the same tree as the deterministic generator, and the value of
 * that generator is that its inputs are all visible.
 *
 * Uniqueness comes from two parts. The timestamp separates sessions across a
 * process; the sequence separates them within one, so two seeds minted in the
 * same millisecond still differ. The sequence is deliberately small and
 * wrapping — it is a tiebreaker, not a counter anyone should read.
 *
 * None of this touches generation. generateSession is a pure function of the
 * seed it is handed; where that seed came from is not its concern.
 */

let sequence = 0;

/**
 * @param at Milliseconds since the epoch, from the caller's clock.
 */
export const makeSeed = (at: number): string => {
  sequence = (sequence + 1) % 0x10000;
  return `s-${Math.trunc(at).toString(36)}-${sequence.toString(36)}`;
};
