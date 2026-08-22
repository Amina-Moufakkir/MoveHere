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
    '3 × 8 per side',
    'a unilateral dose must say so — without it the user does half the work',
  );
  assert.equal(
    doseText(total),
    '3 × 8',
    'a bilateral dose must not say per side — with it the user does double',
  );
});

test('held time and distance render in their own units', () => {
  assert.equal(doseText({ kind: 'time', sets: 2, seconds: 40, counting: 'total' }), '2 × 40s');
  assert.equal(
    doseText({ kind: 'time', sets: 2, seconds: 30, counting: 'per-side' }),
    '2 × 30s per side',
  );
  assert.equal(doseText({ kind: 'distance', meters: 400 }), '400 m');
});

test('a single timed effort promotes the duration and demotes the set count', () => {
  assert.deepEqual(
    prescriptionDisplay({ kind: 'time', sets: 1, seconds: 45, counting: 'total' }),
    { kind: 'single', value: '45', unit: 's', support: ['1 set'] },
    'the duration is the useful number; rendering "1 ×" at display size spends ' +
      'the loudest type in the product on the least useful digit on screen',
  );
  assert.deepEqual(
    prescriptionDisplay({ kind: 'time', sets: 1, seconds: 240, counting: 'total' }),
    { kind: 'single', value: '4', unit: 'min', support: ['1 set'] },
    'nobody counts a four-minute walk in seconds',
  );
});

test('two numbers that both matter stay a pair', () => {
  assert.deepEqual(prescriptionDisplay({ kind: 'reps', sets: 4, reps: 10, counting: 'total' }), {
    kind: 'pair',
    first: '4',
    second: '10',
    support: [],
  });
  assert.deepEqual(prescriptionDisplay({ kind: 'time', sets: 2, seconds: 40, counting: 'total' }), {
    kind: 'pair',
    first: '2',
    second: '40s',
    support: [],
  });
});

test('counting is supporting text, never a numeral', () => {
  const perSide = prescriptionDisplay({ kind: 'reps', sets: 3, reps: 8, counting: 'per-side' });
  assert.deepEqual(perSide.support, ['per side'], 'the qualifier must survive a numerals-only display');
  assert.equal(perSide.kind, 'pair');
  const both = prescriptionDisplay({ kind: 'time', sets: 1, seconds: 30, counting: 'per-side' });
  assert.deepEqual(both.support, ['1 set', 'per side'], 'a demoted set count and a qualifier both show');
});

test('distance is a value and a unit', () => {
  assert.deepEqual(prescriptionDisplay({ kind: 'distance', meters: 400 }), {
    kind: 'single',
    value: '400',
    unit: 'm',
    support: [],
  });
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
          const text = doseText(slot.prescription);
          const d = prescriptionDisplay(slot.prescription);
          assert.ok(text.length > 0, 'a slot with no renderable dose would show the user nothing');
          const parts = d.kind === 'pair' ? [d.first, d.second] : [d.value, d.unit];
          assert.ok(parts.every((x) => x.length > 0), `empty display part for: ${text}`);
          assert.ok(!text.includes('undefined') && !text.includes('NaN'), `malformed dose: ${text}`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 0, 'the sweep must actually visit slots');
});
