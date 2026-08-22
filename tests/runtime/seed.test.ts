/**
 * Minting a generation seed.
 *
 * A seed is provenance, not a control (§6 step 6). The requirement is only that
 * it varies, so asking for another session produces another session. Both
 * clients use this one helper, having previously satisfied the same requirement
 * three different ways.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeSeed } from '../../src/programming/seed.ts';
import { generateFor } from '../../src/programming/session-builder.ts';
import { candidatesFrom, commitConfirmations } from '../../src/storage/venue-state.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';

const AT = '2026-08-21T00:00:00.000Z';
const ids: SupportedFeatureId[] = ['park-bench', 'pull-up-bar'];
const { inventory } = commitConfirmations(
  candidatesFrom(ids, AT),
  new Map(ids.map((i) => [i, 'present' as ConfirmationDecision])),
  AT,
);

test('seeds minted in the same millisecond still differ', () => {
  const minted = Array.from({ length: 50 }, () => makeSeed(1787351972023));
  assert.equal(
    new Set(minted).size,
    minted.length,
    'a clock alone cannot separate two regenerations in the same tick — ' +
      'colliding seeds would hand the user the identical session and look broken',
  );
});

test('seeds differ across times too', () => {
  const minted = [makeSeed(1000), makeSeed(2000), makeSeed(3000)];
  assert.equal(new Set(minted).size, 3, 'seeds must vary with the clock as well as within it');
});

test('the helper reads no clock of its own', () => {
  // Passing a fixed time must be enough to run it. If it reached for Date.now()
  // internally, shared source would carry a hidden dependency in the same tree
  // as the deterministic generator.
  const a = makeSeed(0);
  assert.ok(typeof a === 'string' && a.length > 0, 'a caller-supplied time must be sufficient');
});

test('a seed is an opaque non-empty string', () => {
  const s = makeSeed(1787351972023);
  assert.equal(typeof s, 'string');
  assert.ok(s.length > 0, 'an empty seed records no provenance');
  assert.ok(!/\s/.test(s), 'a seed is an identifier, not a sentence');
});

test('two seeds from the same tick really do produce different sessions', () => {
  const request = { inventory, minutes: 30 as const, goal: 'strength' as const, conditions: 'acceptable' as const };
  const first = generateFor({ ...request, seed: makeSeed(1787351972023) });
  const second = generateFor({ ...request, seed: makeSeed(1787351972023) });

  assert.ok(first !== null && second !== null, 'both seeds must generate');
  assert.notDeepEqual(
    first,
    second,
    'asking for another session must be able to give one — this is the user-facing ' +
      'requirement the seed exists to satisfy',
  );
});

test('the same seed still reproduces its session', () => {
  const seed = makeSeed(1787351972023);
  const request = { inventory, minutes: 30 as const, goal: 'strength' as const, conditions: 'acceptable' as const, seed };
  assert.deepEqual(
    generateFor(request),
    generateFor(request),
    'seed minting must not disturb the reproducibility the seed exists for',
  );
});
