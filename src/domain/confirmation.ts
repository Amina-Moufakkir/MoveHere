/**
 * The single path from observation to authoritative venue state.
 *
 * Canonical plan: §6 steps 2-3 and 7, §7, §13, §14.
 *
 *     candidate  ->  confirmation  ->  confirmed inventory  ->  generation view
 *
 * Manual feature selection and any future vision detection are both sources of
 * candidates and nothing more. Neither writes confirmed state directly, and
 * vision does not get a second route into generation (CLAUDE.md invariant 3).
 *
 * Every branded type in this module exists to make one thing impossible:
 * fabricating venue state that no user confirmed. Brands protect collections as
 * well as containers, because object spread copies a container's brand and the
 * natural way to "update" an inventory is to spread it.
 *
 * What the brands stop: object literals, update-by-spread, structural clones
 * from other modules, and untrusted persisted state.
 *
 * What they cannot stop: a deliberate type assertion. `x as ConfirmedVenueInventory`
 * and `x as unknown as T` defeat any brand, in any type system TypeScript has.
 * Constructing a branded domain value by assertion, and calling JSON.parse
 * outside RehydrateInventory, are lint and code-review obligations rather than
 * type guarantees. The brands raise the cost of fabricating venue state from
 * "write an object" to "write a deliberate, greppable, reviewable assertion".
 */

import { isSupportedFeatureId } from './feature-registry.ts';
import type { SupportedFeatureId } from './feature.ts';

/** Opaque venue handle. Phase 0 state is local; no coordinates live here (§14). */
export type VenueId = string & { readonly __brand: 'VenueId' };

export type MakeVenueId = (value: string) => VenueId | null;

/**
 * The only way to obtain a VenueId.
 *
 * The invariant is small — a venue handle must identify something — but it is
 * the module's to enforce, not each caller's. Before this existed the app layer
 * minted one by assertion, which is the habit the brands exist to prevent: once
 * `x as VenueId` is acceptable for the easy case, it is available for the hard
 * one. The assertion below is legitimate because it is inside the owning
 * constructor and runs after validation.
 */
export const makeVenueId: MakeVenueId = (value) =>
  value.length > 0 ? (value as VenueId) : null;

/**
 * Where a candidate came from.
 *
 * Provenance differs by source; the resulting CandidateFeature does not. Vision
 * carries model identity and confidence so its proposals stay auditable and so
 * precision can be measured against confirmations (§18).
 */
export type CandidateSource =
  | { readonly kind: 'manual-selection' }
  | {
      readonly kind: 'vision-inference';
      readonly modelVersion: string;
      /** Model confidence, 0-1. Never a threshold for skipping confirmation (§6.3). */
      readonly confidence: number;
    };

/**
 * A proposal that a supported feature may exist at a venue.
 *
 * A candidate is not venue state. Nothing downstream of confirmation may read
 * candidates, and no candidate reaches session generation (§6.3).
 */
export interface CandidateFeature {
  readonly featureId: SupportedFeatureId;
  readonly source: CandidateSource;
  readonly observedAt: string;
}

/**
 * The user's answer.
 *
 * `unsure` is a real outcome, not a soft yes. It is recorded and excluded from
 * the inventory: precision over recall, because a missed feature costs options
 * while an invented one creates physical risk (§6.3).
 */
export type ConfirmationDecision = 'present' | 'absent' | 'unsure';

/** One decision on one candidate. */
export interface FeatureConfirmation {
  readonly featureId: SupportedFeatureId;
  readonly decision: ConfirmationDecision;
  readonly decidedAt: string;
  /** Retained for measurement (§18); never consulted by the generator. */
  readonly candidateSource: CandidateSource;
}

/**
 * Whether a confirmed feature can currently be used (§6 step 7).
 *
 * `reported-unusable` is a distinct venue state, not a soft delete. The feature
 * exists and the confirmation stands; it is simply unavailable in practice —
 * occupied, flooded, damaged, fenced off. It stays in the inventory as venue
 * knowledge (§13) and is excluded from generation by projection, not removal.
 */
export type FeatureUsability =
  | { readonly kind: 'usable' }
  | {
      readonly kind: 'reported-unusable';
      readonly reportedAt: string;
      readonly note?: string;
    };

/** A feature the user confirmed present, with its current usability. */
export interface ConfirmedFeature {
  readonly featureId: SupportedFeatureId;
  readonly confirmedAt: string;
  readonly usability: FeatureUsability;
}

/**
 * Post-session correction (§6 step 7).
 *
 * Corrections can only withdraw or downgrade. There is deliberately no variant
 * that adds a feature, because feedback must never silently convert an
 * unsupported or unconfirmed object into a supported one.
 *
 * `feature-absent` withdraws the confirmation. `feature-unusable` keeps it and
 * marks the feature ineligible for generation. `feature-usable-again` restores
 * eligibility for a feature whose confirmation was never withdrawn — it cannot
 * introduce a feature, only clear a downgrade the user themselves applied.
 */
export type VenueCorrection =
  | { readonly kind: 'feature-absent'; readonly featureId: SupportedFeatureId; readonly occurredAt: string }
  | {
      readonly kind: 'feature-unusable';
      readonly featureId: SupportedFeatureId;
      readonly occurredAt: string;
      readonly note?: string;
    }
  | {
      readonly kind: 'feature-usable-again';
      readonly featureId: SupportedFeatureId;
      readonly occurredAt: string;
    };

declare const featureSetWitness: unique symbol;
declare const confirmationWitness: unique symbol;
declare const generationViewWitness: unique symbol;

/**
 * A collection of confirmed features that this module produced.
 *
 * Intersected with the array type rather than wrapping it, because an array
 * spread (`[...set, fabricated]`) yields a plain array and loses the witness,
 * while an object spread of an array does not produce an array at all. That is
 * what closes the update-by-spread hole: an outer `{ ...inventory, features }`
 * still has to supply a features value this module built.
 */
export type ConfirmedFeatureSet = readonly ConfirmedFeature[] & {
  readonly [featureSetWitness]: true;
};

/**
 * Authoritative venue state (§6 step 6).
 *
 * Holds confirmed features in both usability states. Absent and unsure features
 * are not represented here; they live in the confirmation log used for
 * measurement.
 *
 * This type is not what generation reads — see GenerationVenueView.
 */
export interface ConfirmedVenueInventory {
  readonly [confirmationWitness]: true;
  readonly schemaVersion: number;
  readonly venueId: VenueId;
  /** Increments on every correction. Inventories are values, not mutable records. */
  readonly revision: number;
  readonly features: ConfirmedFeatureSet;
  readonly updatedAt: string;
}

/**
 * Opaque identity of the exact feature set a session was generated from.
 *
 * Carried through generation for provenance only. It is deliberately opaque so
 * that branching on it is meaningless.
 */
export type VenueSnapshotId = string & { readonly __brand: 'VenueSnapshotId' };

/**
 * The only venue information session generation may read.
 *
 * Contains confirmed, supported, currently usable feature identifiers and
 * nothing else. venueId, timestamps, revision numbers, candidate sources, and
 * unusable features are structurally absent, so generation cannot branch on
 * them. Two venues with the same usable features therefore produce the same
 * session — which is what makes Gate I's comparison meaningful.
 */
export interface GenerationVenueView {
  readonly [generationViewWitness]: true;
  readonly usableFeatures: UsableFeatureSet;
  readonly snapshotId: VenueSnapshotId;
}

/** Usable feature ids this module projected. Array-intersected for the same reason as ConfirmedFeatureSet. */
export type UsableFeatureSet = readonly SupportedFeatureId[] & {
  readonly [generationViewWitness]: true;
};

/** Inputs to the confirmation step. */
export interface ConfirmationInput {
  readonly venueId: VenueId;
  readonly candidates: readonly CandidateFeature[];
  readonly confirmations: readonly FeatureConfirmation[];
  /** When the confirmation pass completed. Supplied, never read from a clock. */
  readonly at: string;
}

/**
 * Why a confirmation did not reach the inventory.
 *
 * Reported rather than silently dropped: a confirmation for a feature nobody
 * proposed is the shape a fabrication bug would take, and it should be visible.
 */
export interface IgnoredConfirmation {
  readonly featureId: SupportedFeatureId;
  readonly reason: 'no-matching-candidate' | 'superseded';
}

export interface ConfirmationOutcome {
  readonly inventory: ConfirmedVenueInventory;
  readonly ignored: readonly IgnoredConfirmation[];
}

/**
 * Why rehydrating persisted state failed.
 *
 * Failure is a value, not an exception, so callers must handle it. A venue that
 * cannot be trusted is treated as no venue at all: the user is asked to
 * confirm again rather than shown a session built on unverifiable state.
 */
export type RehydrationFailure =
  | { readonly kind: 'malformed'; readonly detail: string }
  | { readonly kind: 'unparseable'; readonly detail: string }
  | { readonly kind: 'duplicate-feature'; readonly featureId: unknown }
  | { readonly kind: 'unsupported-schema-version'; readonly found: unknown }
  | { readonly kind: 'unknown-feature-id'; readonly found: unknown }
  | { readonly kind: 'invalid-usability'; readonly featureId: unknown };

export type RehydrationResult =
  | { readonly ok: true; readonly inventory: ConfirmedVenueInventory }
  | { readonly ok: false; readonly failure: RehydrationFailure };

/**
 * Producers. Implementations must live in this module; the witnesses above are
 * not exported, so no other module can satisfy these return types.
 */

/** Builds inventory from confirmations. Only `present` decisions enter it. */
export type ConfirmInventory = (input: ConfirmationInput) => ConfirmationOutcome;

/** Applies one correction, returning a new inventory at the next revision. */
export type ApplyCorrection = (
  inventory: ConfirmedVenueInventory,
  correction: VenueCorrection,
) => ConfirmedVenueInventory;

/**
 * The persistence boundary (§14).
 *
 * Accepts `unknown`, never a trusted shape. JSON.parse returns `any`, which
 * assigns to anything, so without this boundary the confirmation guarantee
 * holds in memory and evaporates across a reload. Validates against the
 * supported-feature registry before returning trusted state.
 */
export type RehydrateInventory = (raw: unknown) => RehydrationResult;

/**
 * Storage read port.
 *
 * Types persisted state as `unknown` rather than `any`, so no call site can
 * skip rehydration by assigning storage output straight into a trusted type.
 * `JSON.parse` returns `any` and must never be called outside this boundary;
 * that restriction is a lint and code-review obligation, not a type guarantee.
 */
export type ReadPersistedInventory = (venueId: VenueId) => string | null;

/** Writes the serialized form produced by toPersistable. */
export type WritePersistedInventory = (venueId: VenueId, text: string) => void;

/** Parses and validates in one step. JSON.parse happens inside this boundary. */
export type RehydrateInventoryFromJson = (text: string) => RehydrationResult;

/** Projects inventory to the generation view, dropping everything generation may not use. */
export type ProjectGenerationView = (inventory: ConfirmedVenueInventory) => GenerationVenueView;

/* ------------------------------------------------------------------------- *
 * Implementations
 *
 * These live here because the witnesses above are module-local: no other file
 * can produce a ConfirmedVenueInventory, a ConfirmedFeatureSet, or a
 * GenerationVenueView. Every function below is pure and total — no clock, no
 * randomness, no I/O, no throwing. Times are supplied by the caller.
 * ------------------------------------------------------------------------- */

/** Bump when the persisted shape changes. Rehydration refuses other versions. */
export const INVENTORY_SCHEMA_VERSION = 1;

const asFeatureSet = (entries: readonly ConfirmedFeature[]): ConfirmedFeatureSet =>
  entries as ConfirmedFeatureSet;

const asUsableSet = (ids: readonly SupportedFeatureId[]): UsableFeatureSet =>
  ids as UsableFeatureSet;

const asInventory = (value: Omit<ConfirmedVenueInventory, typeof confirmationWitness>) =>
  value as ConfirmedVenueInventory;

/** Codepoint order. Never localeCompare: locale would make output environment-dependent. */
const byFeatureId = (a: { featureId: string }, b: { featureId: string }): number =>
  a.featureId < b.featureId ? -1 : a.featureId > b.featureId ? 1 : 0;

/**
 * Builds inventory from a confirmation pass.
 *
 * Only `present` decisions enter. A confirmation for a feature no candidate
 * proposed is ignored and reported — that is the shape a fabrication bug takes.
 * When a feature is decided more than once the latest decision wins, ordered by
 * decidedAt with array position as a stable tiebreak, so the result does not
 * depend on how the caller happened to order its input.
 */
export const confirmInventory: ConfirmInventory = (input) => {
  const proposed = new Set(input.candidates.map((c) => c.featureId));
  const ignored: IgnoredConfirmation[] = [];
  const latest = new Map<SupportedFeatureId, FeatureConfirmation>();

  const ordered = input.confirmations
    .map((confirmation, index) => ({ confirmation, index }))
    .sort((a, b) => {
      const at = a.confirmation.decidedAt;
      const bt = b.confirmation.decidedAt;
      if (at !== bt) return at < bt ? -1 : 1;
      return a.index - b.index;
    });

  for (const { confirmation } of ordered) {
    if (!proposed.has(confirmation.featureId)) {
      ignored.push({ featureId: confirmation.featureId, reason: 'no-matching-candidate' });
      continue;
    }
    if (latest.has(confirmation.featureId)) {
      ignored.push({ featureId: confirmation.featureId, reason: 'superseded' });
    }
    latest.set(confirmation.featureId, confirmation);
  }

  const features = [...latest.values()]
    .filter((c) => c.decision === 'present')
    .map<ConfirmedFeature>((c) => ({
      featureId: c.featureId,
      confirmedAt: c.decidedAt,
      usability: { kind: 'usable' },
    }))
    .sort(byFeatureId);

  return {
    inventory: asInventory({
      schemaVersion: INVENTORY_SCHEMA_VERSION,
      venueId: input.venueId,
      revision: 1,
      features: asFeatureSet(features),
      updatedAt: input.at,
    }),
    ignored,
  };
};

/**
 * Applies one correction, returning a new inventory at the next revision.
 *
 * Corrections only withdraw or downgrade. `feature-usable-again` clears a
 * downgrade the user applied; it cannot introduce a feature, because it only
 * ever maps over features already present in the inventory.
 */
export const applyCorrection: ApplyCorrection = (inventory, correction) => {
  const current = [...inventory.features];
  const present = current.some((f) => f.featureId === correction.featureId);
  if (!present) return inventory;

  const next: ConfirmedFeature[] =
    correction.kind === 'feature-absent'
      ? current.filter((f) => f.featureId !== correction.featureId)
      : current.map((f) => {
          if (f.featureId !== correction.featureId) return f;
          if (correction.kind === 'feature-unusable') {
            return {
              featureId: f.featureId,
              confirmedAt: f.confirmedAt,
              usability:
                correction.note === undefined
                  ? { kind: 'reported-unusable', reportedAt: correction.occurredAt }
                  : {
                      kind: 'reported-unusable',
                      reportedAt: correction.occurredAt,
                      note: correction.note,
                    },
            };
          }
          return {
            featureId: f.featureId,
            confirmedAt: f.confirmedAt,
            usability: { kind: 'usable' },
          };
        });

  return asInventory({
    schemaVersion: inventory.schemaVersion,
    venueId: inventory.venueId,
    revision: inventory.revision + 1,
    features: asFeatureSet(next.sort(byFeatureId)),
    updatedAt: correction.occurredAt,
  });
};

/**
 * FNV-1a over the canonical feature list.
 *
 * Deliberately excludes venueId, revision, and timestamps: two venues with the
 * same usable features must produce the same snapshot id, because that is what
 * makes Gate I's comparison meaningful.
 */
const digest = (ids: readonly SupportedFeatureId[]): string => {
  let hash = 0x811c9dc5;
  for (const char of ids.join('|')) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

/** Projects inventory to the generation view, dropping everything generation may not use. */
export const projectGenerationView: ProjectGenerationView = (inventory) => {
  const usable = inventory.features
    .filter((f) => f.usability.kind === 'usable')
    .map((f) => f.featureId)
    .sort();

  return {
    usableFeatures: asUsableSet(usable),
    snapshotId: digest(usable) as VenueSnapshotId,
  } as GenerationVenueView;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fail = (failure: RehydrationFailure): RehydrationResult => ({ ok: false, failure });

/** Validates untrusted persisted state against the registry before trusting it. */
export const rehydrateInventory: RehydrateInventory = (raw) => {
  if (!isRecord(raw)) return fail({ kind: 'malformed', detail: 'not an object' });
  if (raw['schemaVersion'] !== INVENTORY_SCHEMA_VERSION) {
    return fail({ kind: 'unsupported-schema-version', found: raw['schemaVersion'] });
  }
  const venueId = raw['venueId'];
  const revision = raw['revision'];
  const updatedAt = raw['updatedAt'];
  const rawFeatures = raw['features'];

  const parsedVenueId = typeof venueId === 'string' ? makeVenueId(venueId) : null;
  if (parsedVenueId === null) {
    return fail({ kind: 'malformed', detail: 'venueId' });
  }
  if (typeof revision !== 'number' || !Number.isInteger(revision) || revision < 1) {
    return fail({ kind: 'malformed', detail: 'revision' });
  }
  if (typeof updatedAt !== 'string' || updatedAt.length === 0) {
    return fail({ kind: 'malformed', detail: 'updatedAt' });
  }
  if (!Array.isArray(rawFeatures)) return fail({ kind: 'malformed', detail: 'features' });

  const seen = new Set<string>();
  const features: ConfirmedFeature[] = [];

  for (const entry of rawFeatures) {
    if (!isRecord(entry)) return fail({ kind: 'malformed', detail: 'feature entry' });
    const featureId = entry['featureId'];
    if (!isSupportedFeatureId(featureId)) return fail({ kind: 'unknown-feature-id', found: featureId });
    if (seen.has(featureId)) return fail({ kind: 'duplicate-feature', featureId });
    seen.add(featureId);

    const confirmedAt = entry['confirmedAt'];
    if (typeof confirmedAt !== 'string' || confirmedAt.length === 0) {
      return fail({ kind: 'malformed', detail: 'confirmedAt' });
    }
    const usability = entry['usability'];
    if (!isRecord(usability)) return fail({ kind: 'invalid-usability', featureId });

    if (usability['kind'] === 'usable') {
      features.push({ featureId, confirmedAt, usability: { kind: 'usable' } });
      continue;
    }
    if (usability['kind'] === 'reported-unusable') {
      const reportedAt = usability['reportedAt'];
      const note = usability['note'];
      if (typeof reportedAt !== 'string' || reportedAt.length === 0) {
        return fail({ kind: 'invalid-usability', featureId });
      }
      if (note !== undefined && typeof note !== 'string') {
        return fail({ kind: 'invalid-usability', featureId });
      }
      features.push({
        featureId,
        confirmedAt,
        usability:
          note === undefined
            ? { kind: 'reported-unusable', reportedAt }
            : { kind: 'reported-unusable', reportedAt, note },
      });
      continue;
    }
    return fail({ kind: 'invalid-usability', featureId });
  }

  return {
    ok: true,
    inventory: asInventory({
      schemaVersion: INVENTORY_SCHEMA_VERSION,
      venueId: parsedVenueId,
      revision,
      features: asFeatureSet(features.sort(byFeatureId)),
      updatedAt,
    }),
  };
};

/**
 * Parses and validates together.
 *
 * JSON.parse lives here and nowhere else: it returns `any`, which assigns to
 * anything, so calling it outside this boundary would defeat the confirmation
 * guarantee across a reload (CLAUDE.md).
 */
export const rehydrateInventoryFromJson: RehydrateInventoryFromJson = (text) => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (error) {
    return fail({ kind: 'unparseable', detail: error instanceof Error ? error.message : 'invalid JSON' });
  }
  return rehydrateInventory(parsed);
};

/** Serializes for storage. The brand is a symbol and does not survive JSON, by design. */
export const toPersistable = (inventory: ConfirmedVenueInventory): string =>
  JSON.stringify({
    schemaVersion: inventory.schemaVersion,
    venueId: inventory.venueId,
    revision: inventory.revision,
    updatedAt: inventory.updatedAt,
    features: inventory.features.map((f) => ({
      featureId: f.featureId,
      confirmedAt: f.confirmedAt,
      usability: f.usability,
    })),
  });
