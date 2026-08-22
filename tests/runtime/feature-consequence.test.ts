/**
 * What confirmation tells the user it will change.
 *
 * This is the basis of a trust decision, not decoration: the user answers "is
 * the bench there?" partly on the strength of what confirming it would unlock.
 * Both clients render these strings, so a divergence would mean telling two
 * users different things about the same bench.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  consequenceFor,
  movementCountFor,
  movementsUnlockedBy,
} from '../../src/presentation/feature-consequence.ts';
import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';
import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../../src/domain/exercise-catalog.ts';

const matrix = (() => {
  const r = loadMatrix(AUTHORED_MATRIX);
  assert.ok(r.ok, 'the shipped matrix must load for this suite to mean anything');
  return r.matrix;
})();

test('every supported feature reports the movements the matrix actually claims', () => {
  for (const feature of FEATURE_REGISTRY.supported) {
    const reported = movementsUnlockedBy(feature.id);
    const expected = [
      ...new Set(
        matrix.compatibilities
          .filter((c) => c.featureId === feature.id)
          .map((c) => matrix.exercises.find((e) => e.id === c.exerciseId)?.name)
          .filter((n): n is string => n !== undefined),
      ),
    ].sort();

    assert.deepEqual(
      reported,
      expected,
      `${feature.id}: the consequence shown must be the matrix's real claims, not a subset or a guess`,
    );
    assert.ok(reported.length > 0, `${feature.id}: a registry feature that unlocks nothing fails §7's material-contribution test`);
  }
});

test('movement names are deduplicated, so a count is movements not claims', () => {
  for (const feature of FEATURE_REGISTRY.supported) {
    const names = movementsUnlockedBy(feature.id);
    assert.equal(new Set(names).size, names.length, `${feature.id}: a movement must not be listed twice`);
  }
});

test('a count over several features counts each movement once', () => {
  const all = FEATURE_REGISTRY.supported.map((f) => f.id);
  const union = new Set(all.flatMap((id) => movementsUnlockedBy(id)));

  assert.equal(
    movementCountFor(all),
    union.size,
    'two features unlocking the same movement must not make it count twice — ' +
      'the number tells a user what they can do, not how many claims exist',
  );
  assert.equal(movementCountFor([]), 0, 'nothing confirmed unlocks nothing');
});

test('dropping a feature never increases the movement count', () => {
  const all = FEATURE_REGISTRY.supported.map((f) => f.id);
  const full = movementCountFor(all);
  for (const dropped of all) {
    const fewer = movementCountFor(all.filter((id) => id !== dropped));
    assert.ok(
      fewer <= full,
      `withdrawing ${dropped} must never widen what MoveHere offers — ` +
        'precision over recall means a downgrade costs options, never adds them',
    );
  }
});

test('the consequence states a fact when trusted and a hypothetical when not', () => {
  const id = 'park-bench' as const;
  const trusted = consequenceFor(id, true);
  const untrusted = consequenceFor(id, false);

  assert.ok(trusted?.startsWith('Adds '), 'a confirmed feature states what it adds');
  assert.ok(
    untrusted?.startsWith('Would add '),
    'an unconfirmed feature must read as a hypothetical — restating it as a fact ' +
      'would claim a confirmation the user has not given',
  );
  assert.equal(
    trusted?.slice('Adds '.length),
    untrusted?.slice('Would add '.length),
    'only the framing changes with trust, never the movements listed',
  );
});

test('the consequence never claims anything about safety', () => {
  const forbidden = /\b(safe|safety|verified|certified|approved|inspected|sound|guarantee)\b/i;
  for (const feature of FEATURE_REGISTRY.supported) {
    for (const trusted of [true, false]) {
      const line = consequenceFor(feature.id, trusted) ?? '';
      assert.ok(
        !forbidden.test(line),
        `${feature.id}: consequence copy must describe eligible movements only — ` +
          'MoveHere has no authority to assess whether a structure is safe (§9)',
      );
    }
  }
});
