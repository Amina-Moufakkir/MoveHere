/**
 * Rendering a prescription as text.
 *
 * Shared because these strings state what the user is being asked to do. "3 × 8
 * per side" and "3 × 8" are different instructions, and a client that dropped
 * the suffix would quietly halve or double the work — rep counting is a
 * property of the prescription and states what a prescribed number means (§15).
 *
 * Pure functions of a Prescription. No layout, no styling, no assumptions about
 * how large the result is displayed.
 */

import type { Prescription } from '../domain/exercise.ts';

/** Whether a prescribed number applies per side or to both together. */
const sideSuffix = (p: Prescription): string =>
  'counting' in p && p.counting === 'per-side' ? ' per side' : '';

/** The full dose, as one line: "3 × 8 per side", "2 × 40s", "400 m". */
export const doseText = (p: Prescription): string => {
  if (p.kind === 'reps') return `${p.sets} × ${p.reps}${sideSuffix(p)}`;
  if (p.kind === 'time') return `${p.sets} × ${p.seconds}s${sideSuffix(p)}`;
  return `${p.meters} m`;
};

/**
 * The dose split into two display parts, for the oversized numerals.
 *
 * A single long effort reads as minutes rather than "1 × 240s": three-digit
 * seconds overflow the display size, and nobody counts a four-minute walk in
 * seconds anyway. Multi-set work keeps sets × duration.
 *
 * Returned as data so each client decides how to lay it out — the web sets a
 * multiplication sign between them, and a client with less width need not.
 */
export const doseParts = (p: Prescription): readonly [string, string] => {
  if (p.kind === 'reps') return [String(p.sets), String(p.reps)];
  if (p.kind === 'time') {
    if (p.sets === 1 && p.seconds >= 120) return [String(Math.round(p.seconds / 60)), 'min'];
    return [String(p.sets), `${p.seconds}s`];
  }
  return [String(p.meters), 'm'];
};

/**
 * The counting qualifier on its own.
 *
 * doseParts renders numerals only, so a screen showing "3 × 8" would silently
 * drop what that 8 means. Rep counting is a property of the prescription and
 * states what a prescribed number stands for (§15) — losing it halves or
 * doubles the work — so a display that spends its largest type on the numbers
 * has to show this beside them.
 */
export const countingNote = (p: Prescription): string | null =>
  'counting' in p && p.counting === 'per-side' ? 'per side' : null;

/** True when the two parts are a count and a unit rather than sets × amount. */
export const isSingleEffort = (parts: readonly [string, string]): boolean =>
  parts[1] === 'min' || parts[1] === 'm';
