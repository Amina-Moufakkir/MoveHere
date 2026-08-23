/**
 * Resolving a movement's instructions against the context a session cited (§8).
 *
 * A split squat with the rear foot on the ground and one with it raised on a
 * bench begin from different positions. So the authored instruction declares
 * the context it constructs, and carries phase overrides for the others; this
 * module applies them.
 *
 * Resolution is against `SelectionBasis` — the same value the workout screen's
 * badge and the exercise visual already key on. Instructions therefore cannot
 * disagree with what the screen says the session relied on.
 *
 * **Context decides where a person puts their foot; the prescription decides
 * how many and which side.** Nothing here touches counting. Side-switching is
 * derived from the prescription at render time, from the same place, for the
 * same reason it always was.
 *
 * Pure, total, deterministic. No clock, no I/O, no throwing.
 */

import type {
  Exercise,
  InstructionOverride,
  MovementStep,
  MovementStepKind,
  PresentableAuthority,
} from './exercise.ts';
import type { SelectionBasis } from './session.ts';

type NonEmpty<T> = readonly [T, ...T[]];

/**
 * What a client renders.
 *
 * The same three states as the authored form, minus the machinery: a resolved
 * instruction is a flat ordered list, because which context produced it stops
 * mattering the moment it has been produced.
 */
export type ResolvedInstructions =
  | {
      readonly kind: 'authored';
      readonly steps: NonEmpty<MovementStep>;
      /** The weakest tier among the parts actually used. */
      readonly authority: PresentableAuthority;
    }
  | { readonly kind: 'not-required'; readonly reason: string }
  | { readonly kind: 'outstanding' };

/** Phase order. The order steps are authored in and resolved into. */
export const PHASE_ORDER: readonly MovementStepKind[] = ['setup', 'action', 'return'];

/**
 * project-content is weaker than reviewed.
 *
 * An override added after a review would otherwise ride on the reviewed tier
 * without having been reviewed, which is the laundering that giving an
 * instruction its own authority exists to prevent, one level further down.
 */
const weaker = (a: PresentableAuthority, b: PresentableAuthority): PresentableAuthority =>
  a.status === 'project-content' ? a : b;

/** The feature this basis cites, or null when the movement needed nothing. */
const featureOf = (basis: SelectionBasis): string | null =>
  basis.kind === 'confirmed-feature' ? String(basis.featureId) : null;

/**
 * The instructions to show for this movement as this session cited it.
 *
 * Total by construction: a phase is only ever replaced by a non-empty set of
 * steps of the same kind, so a resolved instruction carries every phase the
 * default carried and cannot lose its setup or its action.
 */
export const resolveInstructions = (
  exercise: Exercise,
  basis: SelectionBasis,
): ResolvedInstructions => {
  const state = exercise.instructions;

  // Neither is context-sensitive: whether a movement has instructions is a
  // fact about the movement, not about where it is performed.
  if (state.kind !== 'authored') return state;

  const featureId = featureOf(basis);
  const overrides: readonly InstructionOverride[] =
    featureId === null
      ? []
      : (state.overrides ?? []).filter((o) => String(o.featureId) === featureId);

  if (overrides.length === 0) {
    return { kind: 'authored', steps: state.steps, authority: state.authority };
  }

  const replaced = new Map<MovementStepKind, InstructionOverride>();
  for (const override of overrides) replaced.set(override.replaces, override);

  const steps: MovementStep[] = [];
  for (const phase of PHASE_ORDER) {
    const override = replaced.get(phase);
    if (override !== undefined) {
      steps.push(...override.steps);
      continue;
    }
    steps.push(...state.steps.filter((s) => s.kind === phase));
  }

  let authority = state.authority;
  for (const override of replaced.values()) authority = weaker(authority, override.authority);

  const [first, ...rest] = steps;
  // Unreachable: the default carries a setup and an action, and a phase can
  // only be replaced by a non-empty set. Falling back rather than throwing
  // keeps this module total.
  if (first === undefined) {
    return { kind: 'authored', steps: state.steps, authority: state.authority };
  }
  return { kind: 'authored', steps: [first, ...rest], authority };
};

/**
 * Every context this movement can legitimately be generated in.
 *
 * Used by validation to prove each one resolves completely. Takes the cited
 * sets rather than the matrix, so this module stays free of the loader.
 */
export const instructionContextsFor = (
  isEnvironmentIndependent: boolean,
  citedFeatureIds: readonly string[],
): readonly ({ kind: 'environment-independent' } | { kind: 'confirmed-feature'; featureId: string })[] => [
  ...(isEnvironmentIndependent ? [{ kind: 'environment-independent' as const }] : []),
  ...citedFeatureIds.map((featureId) => ({ kind: 'confirmed-feature' as const, featureId })),
];
