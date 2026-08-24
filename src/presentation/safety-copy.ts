/**
 * The words MoveHere uses about its own authority.
 *
 * Canonical plan: §8 (project-content authority), §9 (safety authority
 * boundary), §10 (injury and medical scope).
 *
 * Shared by both clients and deliberately not re-authored per client. Two
 * independently written copies of a safety claim can drift, and only one of
 * them would be reviewed — which is exactly how a client ends up quietly
 * implying a verdict MoveHere has not made and cannot make.
 *
 * Nothing here may be reworded into a statement that MoveHere has checked,
 * verified, approved, or certified a structure. That is not a style
 * preference; it is the boundary the product is built around.
 *
 * Written with real characters, never HTML entities — see session-copy.ts.
 */

/**
 * Provenance label for generated content (§8).
 *
 * Persistent but quiet: it belongs on screen for the whole session, because a
 * user should never be mid-workout and unaware of what authored what they are
 * being shown. It is a caption, not a warning, and must not be styled as one.
 *
 * It names visuals as well as programming. "Training content" was technically
 * broad enough to cover a demonstration, but a note that only says
 * *programming* has not been reviewed leaves room to read the picture as
 * separately vouched for — and once every movement carries one, that reading
 * gets easier, not harder.
 *
 * Movement instructions joined it when they became visible, and not before. An
 * instruction tells a person how to move, which reads as more authoritative
 * than programming rather than less, so the note has to reach it. It names only
 * content that exists: feature-use checks are designed (§9) and unbuilt, and a
 * note describing content nobody can see would be its own small dishonesty.
 *
 * **The subject list grows; the predicate does not.** *…use project-created
 * training content that has not been reviewed by a qualified fitness
 * professional* is the reviewed half of this sentence and is asserted on
 * directly in `tests/runtime/safety-language.test.ts`. Adding a content type
 * must never reword the claim being withheld.
 *
 * **One statement, not one per asset.** The provenance question is whether the
 * instructional content has had professional review, not which tool helped
 * make the pixels. A per-image "AI-generated" badge would answer a question
 * nobody is asking while burying the one that matters, and would turn every
 * workout screen into a warning.
 */
export const PROJECT_CONTENT_NOTE =
  'Sessions, exercise visuals, and movement instructions use project-created training content that has not been reviewed by a qualified fitness professional.';

/** Standing disclaimers. Present on every screen, on every client. */
export const NOT_MEDICAL_ADVICE =
  'MoveHere — exploratory project. Not medical or rehabilitation advice.';

export const NO_SAFETY_ASSESSMENT =
  'Confirm what is actually there. Nothing here assesses whether it is safe to use.';

export interface BoundaryStatement {
  readonly heading: string;
  readonly body: string;
}

export const BOUNDARY_HEADING = 'What MoveHere doesn’t decide';

/**
 * The two things MoveHere refuses to decide, stated plainly (§9, §10).
 *
 * Kept as data rather than markup so both clients state the boundary in the
 * same words and in the same order, and so adding or softening one is a
 * reviewable change to a single file.
 */
export const BOUNDARY_STATEMENTS: readonly BoundaryStatement[] = [
  {
    heading: 'Whether anything is safe to use',
    body: 'MoveHere can tell that a bench is a bench. It has no idea whether that particular bench is sound, or whether it will take your weight. It has never seen it. You look at it, and you decide.',
  },
  {
    heading: 'Anything medical',
    body: 'No injury programming, no rehabilitation, no working around a condition. That isn’t a feature waiting to be added — it’s a line MoveHere doesn’t cross.',
  },
];
