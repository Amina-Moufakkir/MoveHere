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
 * The counting qualifier on its own.
 *
 * A display that spends its largest type on numerals would otherwise drop what
 * those numerals mean. Rep counting states what a prescribed number stands for
 * (§15); losing it halves or doubles the work.
 */
export const countingNote = (p: Prescription): string | null =>
  'counting' in p && p.counting === 'per-side' ? 'per side' : null;

/**
 * How a prescription should be displayed, by kind.
 *
 * One display treatment cannot serve every prescription. "4 × 10" is two
 * numbers that both matter. "1 × 45s" is one number that matters and one that
 * does not — rendering the `1 ×` at display size spends the loudest type in the
 * product on the least useful digit on the screen, and pushes the duration,
 * which is the thing a person actually needs mid-effort, down to the same
 * weight as the noise.
 *
 * So a single timed effort promotes its duration and demotes the set count to
 * supporting text. Counting stays supporting text too: it qualifies the number
 * rather than being one.
 *
 * Returned as data. Each client decides sizes; this decides what is the hero.
 */
export type PrescriptionDisplay =
  | {
      /** Two numerals that both carry meaning, shown as `first × second`. */
      readonly kind: 'pair';
      readonly first: string;
      readonly second: string;
      readonly support: readonly string[];
    }
  | {
      /** One numeral and its unit. The unit is set smaller than the value. */
      readonly kind: 'single';
      readonly value: string;
      readonly unit: string;
      readonly support: readonly string[];
    };

export const prescriptionDisplay = (p: Prescription): PrescriptionDisplay => {
  const side = countingNote(p);
  const support = (extra: readonly string[]): readonly string[] =>
    side === null ? extra : [...extra, side];

  if (p.kind === 'reps') {
    return { kind: 'pair', first: String(p.sets), second: String(p.reps), support: support([]) };
  }

  if (p.kind === 'time') {
    if (p.sets === 1) {
      // Nobody counts a four-minute walk in seconds, and nobody needs "1 ×".
      const asMinutes = p.seconds >= 120;
      return {
        kind: 'single',
        value: asMinutes ? String(Math.round(p.seconds / 60)) : String(p.seconds),
        unit: asMinutes ? 'min' : 's',
        support: support(['1 set']),
      };
    }
    return {
      kind: 'pair',
      first: String(p.sets),
      second: `${p.seconds}s`,
      support: support([]),
    };
  }

  return { kind: 'single', value: String(p.meters), unit: 'm', support: support([]) };
};
