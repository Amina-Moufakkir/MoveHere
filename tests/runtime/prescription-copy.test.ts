/**
 * Rendering a prescription as an instruction.
 *
 * "3 x 8 per side" and "3 x 8" are different instructions. Rep counting states
 * what a prescribed number means (§15), so dropping the suffix would quietly
 * halve or double the work — which is why this is shared rather than owned by
 * each client.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  countingNote,
  doseText,
  prescriptionDisplay,
} from '../../src/presentation/prescription-copy.ts';
import type { Prescription } from '../../src/domain/exercise.ts';
import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../../src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from '../../src/domain/policy-loader.ts';
import { AUTHORED_POLICIES } from '../../src/domain/policy-catalog.ts';
import { SESSION_DURATIONS, SESSION_GOALS } from '../../src/domain/session.ts';

test('per-side counting is stated, and total counting is not', () => {
  const perSide: Prescription = { kind: 'reps', sets: 3, reps: 8, counting: 'per-side' };
  const total: Prescription = { kind: 'reps', sets: 3, reps: 8, counting: 'total' };

  assert.equal(
    doseText(perSide),
    '3 sets × 8 reps per side',
    'a unilateral dose must say so — without it the user does half the work',
  );
  assert.equal(
    doseText(total),
    '3 sets × 10 reps'.replace('10', '8'),
    'a bilateral dose must not say per side — with it the user does double',
  );
});

test('reps and time are told apart by their words, not by punctuation', () => {
  // "3 × 30" and "3 × 30s" differ by one character. Told in words they cannot
  // be confused, which matters most for the reader least able to infer it.
  assert.equal(doseText({ kind: 'reps', sets: 3, reps: 30, counting: 'total' }), '3 sets × 30 reps');
  assert.equal(doseText({ kind: 'time', sets: 3, seconds: 30, counting: 'total' }), '3 sets × 30 sec');

  const reps = prescriptionDisplay({ kind: 'reps', sets: 3, reps: 30, counting: 'total' });
  const time = prescriptionDisplay({ kind: 'time', sets: 3, seconds: 30, counting: 'total' });
  assert.ok(reps.kind === 'pair' && time.kind === 'pair');
  assert.equal(reps.second.unit, 'reps');
  assert.equal(time.second.unit, 'sec');
  assert.notEqual(reps.second.unit, time.second.unit);
});

test('per-side rides on the unit it qualifies', () => {
  const perSide = prescriptionDisplay({ kind: 'reps', sets: 3, reps: 8, counting: 'per-side' });
  const total = prescriptionDisplay({ kind: 'reps', sets: 3, reps: 8, counting: 'total' });
  assert.ok(perSide.kind === 'pair' && total.kind === 'pair');

  assert.equal(perSide.second.unit, 'reps per side');
  assert.equal(total.second.unit, 'reps');
  assert.notDeepEqual(perSide.second, total.second, 'the same numerals must not render alike');

  // Counting is no longer a separate line that a numerals-only read can drop.
  assert.deepEqual(perSide.support, []);

  const heldPerSide = prescriptionDisplay({ kind: 'time', sets: 2, seconds: 30, counting: 'per-side' });
  assert.ok(heldPerSide.kind === 'pair');
  assert.equal(heldPerSide.second.unit, 'sec per side');
});

test('counting is never inferred from laterality', () => {
  // Identical shapes, opposite counting, rendered from the prescription alone.
  const p = (counting: 'total' | 'per-side'): Prescription =>
    ({ kind: 'reps', sets: 3, reps: 8, counting });
  assert.notEqual(doseText(p('total')), doseText(p('per-side')));
  assert.ok(doseText(p('per-side')).endsWith('per side'));
  assert.ok(!doseText(p('total')).includes('per side'));
});

test('a single timed effort promotes the duration and demotes the set count', () => {
  assert.deepEqual(
    prescriptionDisplay({ kind: 'time', sets: 1, seconds: 45, counting: 'total' }),
    { kind: 'single', value: '45', unit: 'sec', support: ['1 set'] },
    'the duration is the useful number; rendering "1 ×" at display size spends ' +
      'the loudest type in the product on the least useful digit on screen',
  );
  assert.deepEqual(
    prescriptionDisplay({ kind: 'time', sets: 1, seconds: 240, counting: 'total' }),
    { kind: 'single', value: '4', unit: 'min', support: ['1 set'] },
    'nobody counts a four-minute walk in seconds',
  );
  assert.deepEqual(
    prescriptionDisplay({ kind: 'time', sets: 1, seconds: 45, counting: 'per-side' }),
    { kind: 'single', value: '45', unit: 'sec per side', support: ['1 set'] },
  );
});

test('a duration becomes minutes only when it is whole minutes', () => {
  // 150 seconds rounded to "3 min" overstated a prescribed effort by half a
  // minute. A duration someone is asked to sustain is not rounded for tidiness.
  const shown = (seconds: number) => {
    const d = prescriptionDisplay({ kind: 'time', sets: 1, seconds, counting: 'total' });
    assert.ok(d.kind === 'single');
    return `${d.value} ${d.unit}`;
  };
  assert.equal(shown(120), '2 min');
  assert.equal(shown(300), '5 min');
  assert.equal(shown(150), '150 sec');
  assert.equal(shown(90), '90 sec');
});

test('two numbers that both matter stay a pair, each with its unit', () => {
  assert.deepEqual(prescriptionDisplay({ kind: 'reps', sets: 4, reps: 10, counting: 'total' }), {
    kind: 'pair',
    first: { value: '4', unit: 'sets' },
    second: { value: '10', unit: 'reps' },
    support: [],
  });
  assert.deepEqual(prescriptionDisplay({ kind: 'time', sets: 2, seconds: 40, counting: 'total' }), {
    kind: 'pair',
    first: { value: '2', unit: 'sets' },
    second: { value: '40', unit: 'sec' },
    support: [],
  });
});

test('a lone set or rep is not pluralised', () => {
  assert.equal(doseText({ kind: 'reps', sets: 1, reps: 1, counting: 'total' }), '1 set × 1 rep');
});

test('the spoken dose and the shown dose describe the same prescription', () => {
  // doseText is the accessibility label for the block the display renders.
  const p: Prescription = { kind: 'time', sets: 1, seconds: 240, counting: 'total' };
  const d = prescriptionDisplay(p);
  assert.ok(d.kind === 'single');
  assert.ok(doseText(p).includes(`${d.value} ${d.unit}`), 'the spoken form must contain the shown one');
  assert.ok(doseText(p).includes('1 set'), 'and must not drop what the display demoted');
});

test('distance is a value and a unit', () => {
  assert.deepEqual(prescriptionDisplay({ kind: 'distance', meters: 400 }), {
    kind: 'single',
    value: '400',
    unit: 'm',
    support: [],
  });
  assert.equal(doseText({ kind: 'distance', meters: 400 }), '400 m');
});

test('countingNote still reports the qualifier for callers that want it alone', () => {
  assert.equal(countingNote({ kind: 'reps', sets: 3, reps: 8, counting: 'per-side' }), 'per side');
  assert.equal(countingNote({ kind: 'reps', sets: 3, reps: 8, counting: 'total' }), null);
});

test('every prescription the shipped content can produce renders non-empty', () => {
  const m = loadMatrix(AUTHORED_MATRIX);
  const p = loadGoalPolicies(AUTHORED_POLICIES);
  assert.ok(m.ok && p.ok, 'shipped content must load');
  if (!m.ok || !p.ok) return;

  let checked = 0;
  for (const goal of SESSION_GOALS) {
    for (const duration of SESSION_DURATIONS) {
      for (const block of p.policies.byGoal[goal].programs[duration].blocks) {
        for (const slot of block.slots) {
          // Every authored dosing, not just the slot's primary one: a variant
          // a user can be given is a prescription a user can be shown.
          for (const variant of slot.variants) {
            const text = doseText(variant.prescription);
            const d = prescriptionDisplay(variant.prescription);
            assert.ok(text.length > 0, 'a slot with no renderable dose would show the user nothing');
            const parts =
              d.kind === 'pair'
                ? [d.first.value, d.first.unit, d.second.value, d.second.unit]
                : [d.value, d.unit];
            assert.ok(parts.every((x) => x.length > 0), `empty display part for: ${text}`);
            // No rendered numeral is left without a word saying what it counts.
            assert.ok(/[a-z]/.test(text), `a dose with no unit words: ${text}`);
            assert.ok(!text.includes('undefined') && !text.includes('NaN'), `malformed dose: ${text}`);
            checked++;
          }
        }
      }
    }
  }
  assert.ok(checked > 0, 'the sweep must actually visit slots');
});
