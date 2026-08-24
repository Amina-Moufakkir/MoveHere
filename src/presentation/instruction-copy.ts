/**
 * Turning resolved instructions into something a client can render (§8).
 *
 * Shared, because what a person is shown when a movement has no instruction is
 * a content decision rather than a layout one, and both clients must make it
 * the same way. A client that decided locally could show an empty state on one
 * platform and nothing on the other.
 *
 * **The panel is derived from a resolved result, never from an authored one.**
 * Overrides, default contexts and step kinds are resolution's business.
 * Presentation receives what the session actually cited, already flattened.
 *
 * **Step phases do not survive this boundary.** `setup`, `action` and `return`
 * are how the content model guarantees an instruction is complete; they are not
 * how a person reads one. Dropping them here means no client can display the
 * schema by accident — the ordering already carries everything a reader needs.
 *
 * Instructions render inline in the workout content rather than behind a
 * control that opens them. There is no affordance to label, and nothing to
 * dismiss: the steps are a section of the page, and a reader chooses by
 * scrolling. That also removes the last place a client had to decide something
 * about instructions on its own.
 *
 * Nothing here derives counts, durations, side-switching, tempo, or safety
 * language. An instruction says how to get into a movement and what it is; how
 * much of it to do is the prescription's, and it is rendered elsewhere.
 */

import type { ResolvedInstructions } from '../domain/instruction-resolution.ts';

type NonEmpty<T> = readonly [T, ...T[]];

/** The affordance's label, and the sheet's heading. */
export const INSTRUCTION_HEADING = 'How to do it';

/**
 * The cues' heading.
 *
 * Cues and instructions answer different questions and must not read as one
 * block: a cue is a reminder for someone already moving, an instruction builds
 * the movement for someone who has not. Naming the cue list is what keeps the
 * two separable on screen as well as in the model.
 */
export const CUES_HEADING = 'Key cues';

/**
 * What to render for this movement, as this session cited it.
 *
 * `hidden` is the state for both `outstanding` and `not-required`, and they are
 * deliberately indistinguishable here. The distinction is real and belongs in
 * the content records; on screen it would be an announcement about the
 * project's internal completeness, made to someone mid-workout who did not ask.
 * Neither renders an affordance, and neither renders a message saying one is
 * missing (§8).
 */
export type InstructionPanel =
  | { readonly kind: 'available'; readonly steps: NonEmpty<string> }
  | { readonly kind: 'hidden' };

export const instructionPanel = (resolved: ResolvedInstructions): InstructionPanel => {
  if (resolved.kind !== 'authored') return { kind: 'hidden' };
  const [first, ...rest] = resolved.steps.map((step) => step.text);
  if (first === undefined) return { kind: 'hidden' };
  return { kind: 'available', steps: [first, ...rest] };
};
