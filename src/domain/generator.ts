/**
 * Deterministic session generation (§6 step 6, §11).
 *
 * This module is a policy interpreter. It knows how to canonicalize a pool,
 * fill a slot, and choose a fallback. It contains no fitness judgment: which
 * patterns a goal calls for, how many sets, how long to rest, and what a
 * session should contain all come from reviewed or project-content policy.
 *
 * You should be able to read this file without learning anything about
 * exercise programming.
 *
 * Purity is an obligation, not a type: no clock, no Math.random, no I/O, no
 * network, no storage, no throwing. Tests enforce it.
 */

import type {
  SessionGenerationInput,
  SessionGenerationOutput,
  SessionBlock,
  SessionItem,
  SelectionBasis,
  SelectionAuthority,
  SubstituteReason,
  GenerationProvenance,
  EstimatedMinutes,
  NonEmpty,
} from './session.ts';
import { makeEstimatedMinutes } from './session.ts';
import type { GenerationVenueView } from './confirmation.ts';
import type { ValidatedMatrix } from './matrix-loader.ts';
import type { Exercise, PresentableAuthority } from './exercise.ts';
import type { SupportedFeatureId } from './feature.ts';
import type { SessionDuration } from './session.ts';
import type { SlotTemplate, GenerationContextKind, DurationProgram } from './policy.ts';
import { createRng } from './prng.ts';
import type { Rng } from './prng.ts';

export const GENERATOR_VERSION = '1';

/**
 * A movement that could fill a slot, with the claim that authorizes it.
 *
 * `venueSourced` drives sourcePreference. It is a preference among candidates
 * already proven compatible — never a licence to force a movement in.
 */
interface Candidate {
  readonly exercise: Exercise;
  readonly basis: SelectionBasis;
  readonly venueSourced: boolean;
}

const attestedAt = (authority: PresentableAuthority): string =>
  authority.status === 'reviewed' ? authority.reviewedAt : authority.authoredAt;

const authorityOf = (
  matrix: ValidatedMatrix,
  authority: PresentableAuthority,
): SelectionAuthority => ({
  matrixVersion: matrix.version,
  tier: authority.status,
  attestedAt: attestedAt(authority),
});

/** Codepoint comparison. Never localeCompare: locale would leak into output. */
const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

const canFill = (exercise: Exercise, slot: SlotTemplate): boolean =>
  slot.eligiblePatterns.includes(exercise.pattern) &&
  exercise.prescriptionKinds.includes(slot.prescription.kind);

/**
 * Every movement available in this context, canonically ordered.
 *
 * Built once per generation rather than per slot, and sorted so that permuting
 * any input collection cannot change the result. An exercise reachable through
 * more than one confirmed feature is deduplicated to its lexicographically
 * smallest compatibility claim, so the recorded basis is stable.
 */
const buildPool = (
  matrix: ValidatedMatrix,
  context: GenerationContextKind,
  venue: GenerationVenueView | null,
): readonly Candidate[] => {
  const byId = new Map(matrix.exercises.map((e) => [e.id as string, e]));
  const candidates = new Map<string, Candidate>();

  for (const declaration of matrix.environmentIndependent) {
    const exercise = byId.get(declaration.exerciseId);
    if (exercise === undefined) continue;
    const existing = candidates.get(exercise.id);
    if (existing !== undefined && cmp(basisKey(existing.basis), declaration.id) <= 0) continue;
    candidates.set(exercise.id, {
      exercise,
      venueSourced: false,
      basis: {
        kind: 'environment-independent',
        declarationId: declaration.id,
        authority: authorityOf(matrix, declaration.authority),
      },
    });
  }

  if (context === 'venue-aware' && venue !== null) {
    const usable = new Set<string>(venue.usableFeatures);
    // Sorted so the winning claim for a duplicated exercise is chosen by id,
    // not by the order the matrix happened to list its entries in.
    const claims = [...matrix.compatibilities]
      .filter((c) => usable.has(c.featureId))
      .sort((a, b) => cmp(a.id, b.id));

    for (const claim of claims) {
      const exercise = byId.get(claim.exerciseId);
      if (exercise === undefined) continue;
      const existing = candidates.get(exercise.id);
      // A venue claim replaces an environment-independent one so the session
      // records the venue as the reason the movement is available.
      if (existing !== undefined && existing.venueSourced) continue;
      candidates.set(exercise.id, {
        exercise,
        venueSourced: true,
        basis: {
          kind: 'confirmed-feature',
          featureId: claim.featureId,
          compatibilityId: claim.id,
          authority: authorityOf(matrix, claim.authority),
        },
      });
    }
  }

  return [...candidates.values()].sort((a, b) => cmp(a.exercise.id, b.exercise.id));
};

const basisKey = (basis: SelectionBasis): string =>
  basis.kind === 'environment-independent' ? basis.declarationId : basis.compatibilityId;

/**
 * Fills one slot, or reports that nothing could.
 *
 * sourcePreference narrows an already-eligible pool. When it asks for venue
 * movements and none are eligible, the whole pool is used: preference never
 * becomes a mandate to force an incompatible movement in.
 */
const fillSlot = (
  slot: SlotTemplate,
  pool: readonly Candidate[],
  used: ReadonlySet<string>,
  rng: Rng,
): SessionItem | null => {
  const eligible = pool.filter(
    (c) => canFill(c.exercise, slot) && (slot.allowRepeatExercise || !used.has(c.exercise.id)),
  );
  if (eligible.length === 0) return null;

  const preferred =
    slot.sourcePreference === 'prefer-venue-feature' && eligible.some((c) => c.venueSourced)
      ? eligible.filter((c) => c.venueSourced)
      : eligible;

  // Already canonically ordered by buildPool; the draw happens after ordering
  // so input permutation cannot reach the output.
  const chosen = preferred[rng.nextInt(preferred.length)];
  if (chosen === undefined) return null;

  return {
    exerciseId: chosen.exercise.id,
    prescription: slot.prescription,
    basis: chosen.basis,
  };
};

interface FilledProgram {
  readonly blocks: NonEmpty<SessionBlock>;
  readonly seconds: number;
}

/** Fills a whole program, or returns null when a required slot cannot be filled. */
const fillProgram = (
  program: DurationProgram,
  context: GenerationContextKind,
  pool: readonly Candidate[],
  rng: Rng,
): FilledProgram | null => {
  const used = new Set<string>();
  const blocks: SessionBlock[] = [];
  let seconds = 0;

  for (const template of program.blocks) {
    const items: SessionItem[] = [];
    let blockSeconds = 0;

    for (const slot of template.slots) {
      const item = fillSlot(slot, pool, used, rng);
      if (item === null) {
        if (slot.obligation[context] === 'required') return null;
        continue;
      }
      used.add(item.exerciseId as string);
      items.push(item);
      blockSeconds += slot.estimatedSeconds;
    }

    const [first, ...rest] = items;
    if (first === undefined) continue;
    blocks.push({ name: template.name, items: [first, ...rest] });
    seconds += blockSeconds + program.restBetweenItemsSeconds * (items.length - 1);
  }

  const [firstBlock, ...restBlocks] = blocks;
  if (firstBlock === undefined) return null;

  return {
    blocks: [firstBlock, ...restBlocks],
    seconds: seconds + program.restBetweenBlocksSeconds * (blocks.length - 1),
  };
};

const minutesOf = (seconds: number): EstimatedMinutes | null =>
  makeEstimatedMinutes(Math.max(1, Math.ceil(seconds / 60)));

const provenanceOf = (
  input: SessionGenerationInput,
  venueSnapshot: GenerationVenueView | null,
): GenerationProvenance => ({
  generatorVersion: GENERATOR_VERSION,
  matrixVersion: input.matrix.version,
  policyId: input.policy.id,
  policyVersion: input.policy.version,
  authorityTier: input.policy.authority.status,
  seed: input.seed,
  venueSnapshotId: venueSnapshot === null ? null : venueSnapshot.snapshotId,
});

const featuresUsed = (blocks: NonEmpty<SessionBlock>): readonly SupportedFeatureId[] => {
  const ids = new Set<SupportedFeatureId>();
  for (const block of blocks) {
    for (const item of block.items) {
      if (item.basis.kind === 'confirmed-feature') ids.add(item.basis.featureId);
    }
  }
  return [...ids].sort(cmp);
};

/**
 * Generate a session.
 *
 * Fallback precedence, first match wins:
 *
 *   1. conditions withheld (adverse)      -> substitute, conditions-adverse
 *   2. conditions withheld (unavailable)  -> substitute, conditions-unavailable
 *   3. no venue, or no usable features    -> substitute, no-confirmed-inventory
 *   4. venue-aware program fills          -> park session
 *   5. venue-aware program cannot fill    -> substitute, no-compatible-venue-movements
 *   6. substitute exceeds available time  -> not generated, insufficient-time
 *   7. substitute cannot fill             -> not generated, no-movements-available
 *
 * Conditions outrank inventory: when park use is withheld AND nothing is
 * confirmed, the recorded reason is the conditions cause, because that is what
 * explains why no park session was offered (§11).
 *
 * Steps 6 and 7 are exceptional. Feasibility proves at build time that the
 * environment-independent pool can fill every program, so reaching either
 * indicates a content defect rather than a situation a user got themselves
 * into.
 */
export const generateSession = (input: SessionGenerationInput): SessionGenerationOutput => {
  // SessionMinutes is the branded form of the same closed set of literals.
  const program = input.policy.programs[input.availableMinutes as SessionDuration];

  const substitute = (reason: SubstituteReason): SessionGenerationOutput => {
    const rng = createRng(input.seed);
    const pool = buildPool(input.matrix, 'substitute', null);
    const filled = fillProgram(program, 'substitute', pool, rng);
    if (filled === null) return { kind: 'not-generated', reason: 'no-movements-available' };

    const minutes = minutesOf(filled.seconds);
    if (minutes === null || minutes > input.availableMinutes) {
      return { kind: 'not-generated', reason: 'insufficient-time' };
    }
    return {
      kind: 'substitute-session',
      reason,
      blocks: filled.blocks,
      estimatedMinutes: minutes,
      provenance: provenanceOf(input, null),
    };
  };

  if (input.conditions.kind === 'park-withheld') {
    return substitute(
      input.conditions.cause.kind === 'adverse'
        ? { kind: 'conditions-adverse', cause: input.conditions.cause.cause }
        : { kind: 'conditions-unavailable' },
    );
  }

  if (input.context.kind === 'environment-independent' || input.context.venue.usableFeatures.length === 0) {
    return substitute({ kind: 'no-confirmed-inventory' });
  }

  const venue = input.context.venue;
  const rng = createRng(input.seed);
  const filled = fillProgram(program, 'venue-aware', buildPool(input.matrix, 'venue-aware', venue), rng);
  if (filled === null) return substitute({ kind: 'no-compatible-venue-movements' });

  const used = featuresUsed(filled.blocks);
  const [firstFeature, ...restFeatures] = used;
  // A park session that used no confirmed feature is a substitute wearing the
  // wrong label, and the output type forbids one.
  if (firstFeature === undefined) return substitute({ kind: 'no-compatible-venue-movements' });

  const minutes = minutesOf(filled.seconds);
  if (minutes === null || minutes > input.availableMinutes) {
    return { kind: 'not-generated', reason: 'insufficient-time' };
  }

  return {
    kind: 'park-session',
    blocks: filled.blocks,
    estimatedMinutes: minutes,
    featuresUsed: [firstFeature, ...restFeatures],
    provenance: provenanceOf(input, venue),
  };
};
