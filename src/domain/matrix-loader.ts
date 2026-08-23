/**
 * Matrix validation boundary (§8).
 *
 * Authored content is untrusted at this boundary, exactly as persisted venue
 * state is. Only the loader can produce a ValidatedMatrix, because referential
 * integrity is a process fact rather than something visible in an entry.
 *
 * Draft entries are dropped and reported. Silently filtering them would make a
 * half-authored matrix look complete.
 */

import type {
  AuthoredMatrix,
  ContentAuthority,
  ExerciseCompatibility,
  ExerciseId,
  EnvironmentIndependentMovement,
  MatrixVersion,
  MovementPattern,
  PresentableAuthority,
  Exercise,
} from './exercise.ts';
import { isSupportedFeatureId, FEATURE_REGISTRY } from './feature-registry.ts';

type NonEmpty<T> = readonly [T, ...T[]];

/** A compatibility claim eligible to reach a user. */
export type UsableCompatibility = ExerciseCompatibility & { readonly authority: PresentableAuthority };

/** An environment-independence declaration eligible to reach a user. */
export type UsableEnvironmentIndependentMovement = EnvironmentIndependentMovement & {
  readonly authority: PresentableAuthority;
};

declare const matrixWitness: unique symbol;

/**
 * A matrix that passed validation.
 *
 * Branded because referential integrity is a process fact: you cannot tell by
 * inspecting an entry whether its exerciseId resolves, whether its featureId is
 * Class C, or whether another entry shares its id. Only this module can produce
 * one, and only usable entries survive into it.
 */
export interface ValidatedMatrix {
  readonly [matrixWitness]: true;
  readonly version: MatrixVersion;
  /** The weakest authority present. A session's provenance label follows this. */
  readonly authorityTier: PresentableAuthority['status'];
  readonly exercises: readonly Exercise[];
  readonly compatibilities: readonly UsableCompatibility[];
  readonly environmentIndependent: readonly UsableEnvironmentIndependentMovement[];
}

/** An entry excluded from the validated matrix, reported rather than silently dropped. */
export interface DroppedEntry {
  readonly id: string;
  readonly exerciseId: ExerciseId;
  readonly reason: 'draft';
}

export type MatrixValidationFailure =
  | { readonly kind: 'malformed'; readonly detail: string }
  | { readonly kind: 'unknown-exercise-id'; readonly found: unknown; readonly at: string }
  | { readonly kind: 'excluded-feature-referenced'; readonly found: unknown; readonly at: string }
  | { readonly kind: 'duplicate-id'; readonly id: string }
  | { readonly kind: 'unsourced-content'; readonly id: string }
  | { readonly kind: 'empty-collection'; readonly at: string }
  | { readonly kind: 'orphan-exercise'; readonly exerciseId: ExerciseId }
  | { readonly kind: 'pattern-unreachable'; readonly pattern: MovementPattern };

/**
 * Things worth knowing about a matrix that is nonetheless valid.
 *
 * Advisories are not failures: they describe content gaps that are real product
 * signals rather than defects. A confirmed feature yielding no movements is
 * still a promise the product struggles to keep, and a pattern with only one
 * environment-independent option will produce repetitive substitute sessions.
 */
export type MatrixAdvisory =
  | { readonly kind: 'feature-without-movements'; readonly featureId: string }
  | { readonly kind: 'feature-with-single-movement'; readonly featureId: string }
  | {
      readonly kind: 'thin-environment-independent-pattern';
      readonly pattern: MovementPattern;
      readonly count: number;
    };

export type MatrixLoadResult =
  | {
      readonly ok: true;
      readonly matrix: ValidatedMatrix;
      readonly dropped: readonly DroppedEntry[];
      readonly advisories: readonly MatrixAdvisory[];
    }
  | { readonly ok: false; readonly failures: NonEmpty<MatrixValidationFailure> };

/** Validates authored matrix content. Generation never loads; loading is fallible. */
export type LoadMatrix = (authored: AuthoredMatrix) => MatrixLoadResult;

const asMatrix = (value: Omit<ValidatedMatrix, typeof matrixWitness>): ValidatedMatrix =>
  value as ValidatedMatrix;

const isPresentable = (a: ContentAuthority): a is PresentableAuthority => a.status !== 'draft';

/** project-content is weaker than reviewed; a mixed matrix reports the weaker tier. */
const weakestTier = (
  authorities: readonly PresentableAuthority[],
): PresentableAuthority['status'] =>
  authorities.some((a) => a.status === 'project-content') ? 'project-content' : 'reviewed';

export const loadMatrix: LoadMatrix = (authored: AuthoredMatrix) => {
  const failures: MatrixValidationFailure[] = [];
  const dropped: DroppedEntry[] = [];

  const exerciseIds = new Set<string>();
  for (const exercise of authored.exercises) {
    if (exerciseIds.has(exercise.id)) failures.push({ kind: 'duplicate-id', id: exercise.id });
    exerciseIds.add(exercise.id);
    if (exercise.cues.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exercise.id} cues` });
    }
    // Authored content is untrusted here, so a field the type promises may
    // still be missing at runtime. Report that rather than throwing: a loader
    // that crashes on malformed content cannot report on malformed content.
    if (!Array.isArray(exercise.prescriptionKinds) || exercise.prescriptionKinds.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exercise.id} prescriptionKinds` });
    }
    // A movement with no acceptable counting can fill no slot that prescribes
    // one, which is a content defect rather than a very narrow movement.
    if (!Array.isArray(exercise.countingModes) || exercise.countingModes.length === 0) {
      failures.push({ kind: 'empty-collection', at: `exercise ${exercise.id} countingModes` });
    } else {
      for (const mode of exercise.countingModes) {
        if (mode !== 'total' && mode !== 'per-side') {
          failures.push({
            kind: 'malformed',
            detail: `exercise ${exercise.id} countingModes contains ${String(mode)}`,
          });
        }
      }
    }
  }

  const entryIds = new Set<string>();
  const compatibilities: UsableCompatibility[] = [];

  for (const entry of authored.compatibilities) {
    const at = `compatibility ${entry.id}`;
    if (entryIds.has(entry.id)) failures.push({ kind: 'duplicate-id', id: entry.id });
    entryIds.add(entry.id);

    if (!exerciseIds.has(entry.exerciseId)) {
      failures.push({ kind: 'unknown-exercise-id', found: entry.exerciseId, at });
    }
    // Class C objects are not SupportedFeatureIds, so an excluded reference
    // fails this check rather than needing a separate exclusion list.
    if (!isSupportedFeatureId(entry.featureId)) {
      failures.push({ kind: 'excluded-feature-referenced', found: entry.featureId, at });
    }
    if (!checkSources(entry.authority, entry.id, failures)) continue;

    if (!isPresentable(entry.authority)) {
      dropped.push({ id: entry.id, exerciseId: entry.exerciseId, reason: 'draft' });
      continue;
    }
    compatibilities.push(entry as UsableCompatibility);
  }

  const environmentIndependent: UsableEnvironmentIndependentMovement[] = [];

  for (const entry of authored.environmentIndependent) {
    const at = `environment-independent ${entry.id}`;
    if (entryIds.has(entry.id)) failures.push({ kind: 'duplicate-id', id: entry.id });
    entryIds.add(entry.id);

    if (!exerciseIds.has(entry.exerciseId)) {
      failures.push({ kind: 'unknown-exercise-id', found: entry.exerciseId, at });
    }
    if (!checkSources(entry.authority, entry.id, failures)) continue;

    if (!isPresentable(entry.authority)) {
      dropped.push({ id: entry.id, exerciseId: entry.exerciseId, reason: 'draft' });
      continue;
    }
    environmentIndependent.push(entry as UsableEnvironmentIndependentMovement);
  }

  // An exercise reachable by no route is dead weight in a catalog whose whole
  // point is being small enough to read.
  const reachable = new Set<string>([
    ...compatibilities.map((c) => c.exerciseId),
    ...environmentIndependent.map((e) => e.exerciseId),
  ]);
  for (const exercise of authored.exercises) {
    if (!reachable.has(exercise.id)) {
      failures.push({ kind: 'orphan-exercise', exerciseId: exercise.id });
    }
  }

  // Every pattern the catalog claims must be obtainable somewhere, or the
  // pattern is a promise the matrix cannot keep.
  const byId = new Map(authored.exercises.map((e) => [e.id as string, e]));
  const reachablePatterns = new Set<MovementPattern>();
  for (const id of reachable) {
    const pattern = byId.get(id)?.pattern;
    if (pattern !== undefined) reachablePatterns.add(pattern);
  }
  for (const exercise of authored.exercises) {
    if (!reachablePatterns.has(exercise.pattern)) {
      failures.push({ kind: 'pattern-unreachable', pattern: exercise.pattern });
    }
  }

  if (compatibilities.length === 0) failures.push({ kind: 'empty-collection', at: 'compatibilities' });
  if (environmentIndependent.length === 0) {
    failures.push({ kind: 'empty-collection', at: 'environmentIndependent' });
  }

  const [first, ...rest] = failures;
  if (first !== undefined) return { ok: false, failures: [first, ...rest] };

  const advisories: MatrixAdvisory[] = [];

  for (const feature of FEATURE_REGISTRY.supported) {
    const count = compatibilities.filter((c) => c.featureId === feature.id).length;
    if (count === 0) advisories.push({ kind: 'feature-without-movements', featureId: feature.id });
    else if (count === 1) advisories.push({ kind: 'feature-with-single-movement', featureId: feature.id });
  }

  // Counted over every pattern the catalog contains, not only those with an
  // environment-independent option, so a pattern with zero is reported rather
  // than absent from the tally.
  const eiByPattern = new Map<MovementPattern, number>();
  for (const exercise of authored.exercises) eiByPattern.set(exercise.pattern, 0);
  for (const entry of environmentIndependent) {
    const pattern = byId.get(entry.exerciseId)?.pattern;
    if (pattern !== undefined) eiByPattern.set(pattern, (eiByPattern.get(pattern) ?? 0) + 1);
  }
  for (const [pattern, count] of [...eiByPattern].sort()) {
    if (count < 2) advisories.push({ kind: 'thin-environment-independent-pattern', pattern, count });
  }

  const tiers = [
    ...compatibilities.map((c) => c.authority),
    ...environmentIndependent.map((e) => e.authority),
  ];

  return {
    ok: true,
    matrix: asMatrix({
      version: authored.version,
      authorityTier: weakestTier(tiers),
      exercises: authored.exercises,
      compatibilities,
      environmentIndependent,
    }),
    dropped,
    advisories,
  };
};

/** Project content and reviewed content both have to say what they rest on. */
const checkSources = (
  authority: ContentAuthority,
  id: string,
  failures: MatrixValidationFailure[],
): boolean => {
  if (authority.status === 'project-content' && authority.basisRefs.length === 0) {
    failures.push({ kind: 'unsourced-content', id });
    return false;
  }
  if (authority.status === 'reviewed' && authority.sourceRefs.length === 0) {
    failures.push({ kind: 'unsourced-content', id });
    return false;
  }
  return true;
};
