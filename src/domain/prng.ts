/**
 * Seeded pseudo-random number generator.
 *
 * In-repo and deterministic by construction. `Math.random` is banned in the
 * domain: it would make generation unreproducible and destroy the Gate I and
 * Gate J comparisons, which depend on the same inputs yielding the same session
 * every time.
 *
 * splitmix32 — small, well-distributed, and easy to read. Cryptographic
 * strength is irrelevant here; reproducibility is the whole requirement.
 */

export type GenerationSeed = string & { readonly __brand: 'GenerationSeed' };

/** Seeds are opaque provenance, not a user-facing control (§6 step 6). */
export const seedFrom = (value: string): GenerationSeed => value as GenerationSeed;

/** FNV-1a over the seed text, so any string produces a usable 32-bit state. */
const hashSeed = (seed: string): number => {
  let hash = 0x811c9dc5;
  for (const char of seed) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
};

export interface Rng {
  /** Uniform integer in [0, bound). Returns 0 for a bound of 1 or less. */
  readonly nextInt: (bound: number) => number;
}

/**
 * A generator is stateful but its state is entirely seed-derived, so a fresh
 * Rng from the same seed always yields the same sequence. Callers must consume
 * it in a canonical order — sort first, then draw — or input ordering leaks
 * into the output.
 */
export const createRng = (seed: GenerationSeed): Rng => {
  let state = hashSeed(seed);

  const next = (): number => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
    return (z ^ (z >>> 15)) >>> 0;
  };

  return {
    nextInt: (bound) => (bound <= 1 ? 0 : next() % bound),
  };
};
