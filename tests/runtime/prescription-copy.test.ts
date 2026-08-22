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
  doseParts,
  doseText,
  isSingleEffort,
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

test('a single long effort reads as minutes, not as one set of seconds', () => {
  assert.deepEqual(
    doseParts({ kind: 'time', sets: 1, seconds: 240, counting: 'total' }),
    ['4', 'min'],
    'nobody counts a four-minute walk in seconds, and three digits overflow the display',
  );
  assert.deepEqual(
    doseParts({ kind: 'time', sets: 3, seconds: 240, counting: 'total' }),
    ['3', '240s'],
    'multi-set work keeps sets × duration — the minutes reading is for one continuous effort only',
  );
  assert.deepEqual(
    doseParts({ kind: 'time', sets: 1, seconds: 45, counting: 'total' }),
    ['1', '45s'],
    'a short single effort is still sets × duration',
  );
});

test('the counting qualifier survives a numerals-only display', () => {
  // A screen that spends its largest type on the numbers still has to say what
  // the number means — doseParts alone would silently drop it.
  assert.equal(
    countingNote({ kind: 'reps', sets: 3, reps: 8, counting: 'per-side' }),
    'per side',
    'a unilateral dose must carry its qualifier even when only numerals are shown',
  );
  assert.equal(countingNote({ kind: 'reps', sets: 3, reps: 8, counting: 'total' }), null);
  assert.equal(countingNote({ kind: 'time', sets: 2, seconds: 30, counting: 'per-side' }), 'per side');
  assert.equal(countingNote({ kind: 'distance', meters: 400 }), null, 'distance has no side');
});

test('isSingleEffort agrees with what doseParts produced', () => {
  assert.ok(isSingleEffort(doseParts({ kind: 'time', sets: 1, seconds: 240, counting: 'total' })));
  assert.ok(isSingleEffort(doseParts({ kind: 'distance', meters: 400 })));
  assert.ok(!isSingleEffort(doseParts({ kind: 'reps', sets: 3, reps: 8, counting: 'total' })));
  assert.ok(!isSingleEffort(doseParts({ kind: 'time', sets: 2, seconds: 40, counting: 'total' })));
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
          const [big, small] = doseParts(slot.prescription);
          assert.ok(text.length > 0, 'a slot with no renderable dose would show the user nothing');
          assert.ok(big.length > 0 && small.length > 0, `empty dose part for: ${text}`);
          assert.ok(!text.includes('undefined') && !text.includes('NaN'), `malformed dose: ${text}`);
          checked++;
        }
      }
    }
  }
  assert.ok(checked > 0, 'the sweep must actually visit slots');
});
