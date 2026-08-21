/**
 * Supported-feature registry contracts.
 *
 * Canonical plan: §7 (Supported-Feature Registry), §9 (Safety Authority Boundary).
 *
 * A registry entry describes an object MoveHere is willing to reason about.
 * It carries no claim that any particular real-world instance of that object
 * is structurally sound, maintained, or safe to use. See CLAUDE.md invariant 1.
 */

/**
 * Classification by load-bearing assumption (§7).
 *
 * Class C exists so the system can name what it deliberately excludes and
 * explain the exclusion. It is not a supported state.
 */
export type FeatureClass =
  | 'class-a-ground'
  | 'class-b-engineered-load-bearing'
  | 'class-c-excluded';

/**
 * The classes a supported feature may hold.
 *
 * Deriving this from FeatureClass makes "Class C is never supported" a type
 * error rather than a convention (§7, critical invariant).
 */
export type SupportedFeatureClass = Exclude<FeatureClass, 'class-c-excluded'>;

/**
 * The registry is a closed, curated set (§7). Admitting an id requires the five
 * conditions in §7 — not convenience. Widening this union is a product decision.
 */
export type SupportedFeatureId =
  // Class A — ground-type
  | 'open-ground'
  | 'walking-running-path'
  | 'stairs'
  | 'hill'
  | 'running-track'
  | 'hard-court'
  // Class B — engineered load-bearing
  | 'park-bench'
  | 'pull-up-bar'
  | 'parallel-bars';

/** Objects deliberately excluded from the registry (§7, Class C). */
export type ExcludedObjectId =
  | 'playground-frame'
  | 'tree'
  | 'backstop-fencing'
  | 'wall-or-ledge'
  | 'doorframe'
  | 'countertop'
  | 'sofa-arm'
  | 'picnic-table'
  | 'bleachers';

/** A registry entry. Definition of a feature type, not an observation of one. */
export interface SupportedFeature {
  readonly id: SupportedFeatureId;
  readonly featureClass: SupportedFeatureClass;
  /** User-facing name. Must be understandable without domain knowledge (§7.2). */
  readonly label: string;
  /**
   * The question put to the user during confirmation.
   *
   * Phrased as a question about existence and usability — never about safety,
   * which MoveHere has no authority to assess (§9).
   */
  readonly confirmationPrompt: string;
}

/**
 * An excluded object, recorded so exclusions are explicit and reviewable.
 *
 * `reconsiderWhen` states the evidence that could justify promotion. Bleachers
 * carry the §7 conditions: prevalence, and reliable distinction between fixed
 * and portable construction. If distinguishability fails, prevalence is
 * irrelevant and the object stays excluded.
 */
export interface ExcludedObject {
  readonly id: ExcludedObjectId;
  readonly featureClass: 'class-c-excluded';
  readonly label: string;
  /** Why supporting it would require a structural assumption MoveHere cannot make. */
  readonly exclusionReason: string;
  readonly reconsiderWhen?: string;
}

/** The registry as a whole. Both halves are needed: what is supported, and what is refused. */
export interface FeatureRegistry {
  readonly version: string;
  readonly supported: readonly SupportedFeature[];
  readonly excluded: readonly ExcludedObject[];
}
