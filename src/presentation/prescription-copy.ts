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

/**
 * A number and what it counts.
 *
 * The unit is not decoration. "3 × 10" asks a reader to know that the first
 * number is sets and the second is repetitions, which someone new to training
 * does not, and which the notation never says. Naming both is the difference
 * between a prescription and a pair of digits.
 */
export interface DoseTerm {
  readonly value: string;
  readonly unit: string;
}

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);

/**
 * Counting rides on the unit, not on a separate line.
 *
 * "10 reps per side" is one idea. Splitting it into a numeral and a qualifier
 * elsewhere on screen invites reading the numeral alone, which is exactly how a
 * per-side dose gets halved.
 */
const countingSuffix = (p: Prescription): string =>
  'counting' in p && p.counting === 'per-side' ? ' per side' : '';

/**
 * Seconds shown as minutes only when they are whole minutes.
 *
 * Rounding to the nearest minute displayed a 150-second effort as "3 min",
 * overstating it by half a minute. A duration a person is asked to sustain is
 * not a number to round for tidiness.
 */
const durationTerm = (seconds: number, suffix: string): DoseTerm =>
  seconds >= 120 && seconds % 60 === 0
    ? { value: String(seconds / 60), unit: `min${suffix}` }
    : { value: String(seconds), unit: `sec${suffix}` };

/** The dose a slot prescribes, as sets and the work in each. */
const effortTerm = (p: Prescription): DoseTerm => {
  const suffix = countingSuffix(p);
  if (p.kind === 'reps') return { value: String(p.reps), unit: `${plural(p.reps, 'rep', 'reps')}${suffix}` };
  if (p.kind === 'time') return durationTerm(p.seconds, suffix);
  return { value: String(p.meters), unit: 'm' };
};

const setsTerm = (sets: number): DoseTerm => ({
  value: String(sets),
  unit: plural(sets, 'set', 'sets'),
});

/**
 * The full dose, as one line, in words a beginner can act on:
 * "3 sets × 10 reps", "3 sets × 8 reps per side", "1 set × 2 min", "400 m".
 *
 * Also what assistive technology reads, which is why it carries the set count
 * even where the display demotes it: what is on screen and what is spoken must
 * describe the same prescription.
 */
export const doseText = (p: Prescription): string => {
  const effort = effortTerm(p);
  if (p.kind === 'distance') return `${effort.value} ${effort.unit}`;
  const sets = setsTerm(p.sets);
  return `${sets.value} ${sets.unit} × ${effort.value} ${effort.unit}`;
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

/* Retained for callers that need the qualifier alone. The dose display no
   longer uses it: counting now rides on the unit it qualifies, so a numeral
   and its meaning cannot be read apart. */

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
      /** Two terms that both carry meaning, shown as `first × second`. */
      readonly kind: 'pair';
      readonly first: DoseTerm;
      readonly second: DoseTerm;
      readonly support: readonly string[];
    }
  | {
      /** One term. The unit is set smaller than the value. */
      readonly kind: 'single';
      readonly value: string;
      readonly unit: string;
      readonly support: readonly string[];
    };

export const prescriptionDisplay = (p: Prescription): PrescriptionDisplay => {
  const effort = effortTerm(p);

  if (p.kind === 'distance') {
    return { kind: 'single', value: effort.value, unit: effort.unit, support: [] };
  }

  // A single timed effort promotes its duration and demotes the set count:
  // nobody needs "1 ×" spending the loudest type on the least useful digit.
  if (p.kind === 'time' && p.sets === 1) {
    return { kind: 'single', value: effort.value, unit: effort.unit, support: ['1 set'] };
  }

  return { kind: 'pair', first: setsTerm(p.sets), second: effort, support: [] };
};
