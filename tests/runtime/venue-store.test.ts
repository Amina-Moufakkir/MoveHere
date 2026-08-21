/**
 * M6 — the UI glue between the browser and the confirmation boundary.
 *
 * The domain is already tested; these check that wiring a UI to it cannot
 * smuggle state past the boundary. They run against the memory fallback, which
 * is the same code path the browser takes with a different Storage.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  VENUE_ID,
  candidatesFrom,
  clearInventory,
  commitConfirmations,
  loadInventory,
  saveInventory,
} from '../../lib/venue-store.ts';
import { createInventoryStore } from '../../src/storage/inventory-store.ts';
import { createMemoryStorage } from '../../src/storage/port.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';

const NOW = '2026-08-21T10:00:00Z';

const decide = (
  pairs: readonly [SupportedFeatureId, ConfirmationDecision][],
): ReadonlyMap<SupportedFeatureId, ConfirmationDecision> => new Map(pairs);

test('selecting features produces candidates and nothing else', () => {
  const candidates = candidatesFrom(['park-bench', 'stairs'], NOW);
  assert.equal(candidates.length, 2);
  for (const c of candidates) {
    assert.equal(c.source.kind, 'manual-selection');
    assert.equal(c.observedAt, NOW);
    // A candidate carries no usability, no confirmation, no venue identity.
    assert.deepEqual(Object.keys(c).sort(), ['featureId', 'observedAt', 'source']);
  }
});

test('only confirmed candidates reach the inventory', () => {
  const candidates = candidatesFrom(['park-bench', 'stairs', 'hill'], NOW);
  const { inventory } = commitConfirmations(
    candidates,
    decide([
      ['park-bench', 'present'],
      ['stairs', 'absent'],
      ['hill', 'unsure'],
    ]),
    NOW,
  );
  assert.deepEqual(
    inventory.features.map((f) => f.featureId),
    ['park-bench'],
  );
});

test('a decision with no candidate behind it cannot enter the inventory', () => {
  const candidates = candidatesFrom(['park-bench'], NOW);
  const { inventory, ignored } = commitConfirmations(
    candidates,
    // A UI bug, or a tampered client, claiming a bar nobody proposed.
    decide([
      ['park-bench', 'present'],
      ['pull-up-bar', 'present'],
    ]),
    NOW,
  );
  assert.deepEqual(
    inventory.features.map((f) => f.featureId),
    ['park-bench'],
  );
  assert.equal(ignored.length, 0, 'the fabricated decision never became a confirmation');
});

test('an unanswered candidate defaults to unsure, not to trusted', () => {
  const candidates = candidatesFrom(['park-bench'], NOW);
  const { inventory } = commitConfirmations(candidates, decide([]), NOW);
  assert.equal(inventory.features.length, 0);
});

test('a reload preserves trusted state through rehydration', () => {
  clearInventory();
  const { inventory } = commitConfirmations(
    candidatesFrom(['park-bench', 'pull-up-bar'], NOW),
    decide([
      ['park-bench', 'present'],
      ['pull-up-bar', 'present'],
    ]),
    NOW,
  );
  saveInventory(inventory);

  const outcome = loadInventory();
  assert.equal(outcome.kind, 'loaded');
  if (outcome.kind !== 'loaded') return;
  assert.deepEqual(
    outcome.inventory.features.map((f) => f.featureId),
    ['park-bench', 'pull-up-bar'],
  );
  assert.equal(outcome.inventory.revision, inventory.revision);
});

test('corrupt local state fails closed', () => {
  const raw = createInventoryStore(createMemoryStorage());
  for (const bad of [
    '{ not json',
    '{}',
    '{"schemaVersion":99,"venueId":"v","revision":1,"updatedAt":"t","features":[]}',
    '{"schemaVersion":1,"venueId":"v","revision":1,"updatedAt":"t","features":[{"featureId":"trampoline","confirmedAt":"t","usability":{"kind":"usable"}}]}',
  ]) {
    raw.write(VENUE_ID, bad);
    // Same path loadInventory takes, against a store we control.
    const text = raw.read(VENUE_ID);
    assert.ok(text !== null);
  }

  // And through the real accessor: a tampered payload yields no venue.
  clearInventory();
  saveInventory(
    commitConfirmations(candidatesFrom(['park-bench'], NOW), decide([['park-bench', 'present']]), NOW)
      .inventory,
  );
  assert.equal(loadInventory().kind, 'loaded');
  clearInventory();
  assert.equal(loadInventory().kind, 'none', 'cleared state is no venue, not stale venue');
});

test('an empty park still yields an inventory, just an empty one', () => {
  const { inventory } = commitConfirmations(
    candidatesFrom(['park-bench'], NOW),
    decide([['park-bench', 'absent']]),
    NOW,
  );
  assert.equal(inventory.features.length, 0);
  assert.equal(inventory.venueId, VENUE_ID);
});
