/**
 * Where a fabricated confirmation is refused.
 *
 * confirmation.test.ts covers the boundary itself: confirmInventory reports a
 * confirmation nobody proposed. This covers the layer above it, and the
 * distinction between them, because the two refuse in different ways and only
 * one of them is reachable from a UI.
 *
 * commitConfirmations builds confirmations by mapping over candidates, so an
 * unmatched decision is never turned into a confirmation at all. Its refusal is
 * structural rather than a downstream rejection — which is why `ignored` stays
 * empty on that path, and why an empty `ignored` must not be read as "nothing
 * was attempted".
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { candidatesFrom, commitConfirmations, VENUE_ID } from '../../src/storage/venue-state.ts';
import { confirmInventory } from '../../src/domain/confirmation.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';

const AT = '2026-08-21T00:00:00.000Z';

test('assembly refuses an unmatched decision structurally, without constructing one', () => {
  const candidates = candidatesFrom(['park-bench'], AT);
  const decisions = new Map<SupportedFeatureId, ConfirmationDecision>([
    ['park-bench', 'present'],
    ['pull-up-bar', 'present'],
  ]);

  const { inventory, ignored } = commitConfirmations(candidates, decisions, AT);

  assert.deepEqual(
    inventory.features.map((f) => f.featureId),
    ['park-bench'],
    'a decision for a feature no candidate proposed must never reach the inventory',
  );
  assert.deepEqual(
    ignored,
    [],
    'assembly maps over candidates, so an unmatched decision is never constructed — ' +
      'an empty ignored list here means "never attempted", not "silently dropped"',
  );
});

test('the boundary below still reports one when handed it directly', () => {
  const candidates = candidatesFrom(['park-bench'], AT);
  const { inventory, ignored } = confirmInventory({
    venueId: VENUE_ID,
    candidates,
    confirmations: [
      {
        featureId: 'pull-up-bar',
        decision: 'present',
        decidedAt: AT,
        candidateSource: { kind: 'manual-selection' },
      },
    ],
    at: AT,
  });

  assert.equal(
    inventory.features.length,
    0,
    'an unmatched confirmation must not enter the inventory at either layer',
  );
  assert.deepEqual(
    ignored,
    [{ featureId: 'pull-up-bar', reason: 'no-matching-candidate' }],
    'the boundary must report a fabricated confirmation rather than drop it silently',
  );
});

test('an unanswered candidate is assembled as unsure, not omitted', () => {
  const candidates = candidatesFrom(['park-bench', 'hill'], AT);
  const decisions = new Map<SupportedFeatureId, ConfirmationDecision>([['park-bench', 'present']]);

  const { inventory, ignored } = commitConfirmations(candidates, decisions, AT);

  assert.deepEqual(
    inventory.features.map((f) => f.featureId),
    ['park-bench'],
    'an unanswered candidate must resolve to unsure and stay out of the inventory',
  );
  assert.deepEqual(ignored, [], 'an unanswered candidate is a decision, not a fabrication');
});
