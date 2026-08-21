/**
 * M1 — confirmation runtime.
 *
 * Covers the behaviour the type system cannot: what actually reaches the
 * inventory, what a correction does to it, what the generation view drops, and
 * what survives a round trip through storage.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  confirmInventory,
  applyCorrection,
  projectGenerationView,
  rehydrateInventory,
  rehydrateInventoryFromJson,
  toPersistable,
  INVENTORY_SCHEMA_VERSION,
} from '../../src/domain/confirmation.ts';
import type {
  VenueId,
  CandidateFeature,
  FeatureConfirmation,
  ConfirmationInput,
} from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import {
  createInventoryStore,
  createMemoryStorage,
} from '../../src/storage/inventory-store.ts';

const venue = 'venue-1' as VenueId;

const candidate = (featureId: SupportedFeatureId): CandidateFeature => ({
  featureId,
  source: { kind: 'manual-selection' },
  observedAt: '2026-08-20T10:00:00Z',
});

const decide = (
  featureId: SupportedFeatureId,
  decision: FeatureConfirmation['decision'],
  decidedAt = '2026-08-20T10:05:00Z',
): FeatureConfirmation => ({
  featureId,
  decision,
  decidedAt,
  candidateSource: { kind: 'manual-selection' },
});

const input = (
  candidates: readonly CandidateFeature[],
  confirmations: readonly FeatureConfirmation[],
): ConfirmationInput => ({
  venueId: venue,
  candidates,
  confirmations,
  at: '2026-08-20T10:06:00Z',
});

test('only present decisions enter the inventory', () => {
  const { inventory } = confirmInventory(
    input(
      [candidate('park-bench'), candidate('stairs'), candidate('hill')],
      [decide('park-bench', 'present'), decide('stairs', 'absent'), decide('hill', 'unsure')],
    ),
  );
  assert.deepEqual(
    inventory.features.map((f) => f.featureId),
    ['park-bench'],
  );
});

test('unsure is not a soft yes', () => {
  const { inventory } = confirmInventory(
    input([candidate('pull-up-bar')], [decide('pull-up-bar', 'unsure')]),
  );
  assert.equal(inventory.features.length, 0);
});

test('a confirmation with no matching candidate is ignored and reported', () => {
  const { inventory, ignored } = confirmInventory(
    input([candidate('park-bench')], [decide('pull-up-bar', 'present')]),
  );
  assert.equal(inventory.features.length, 0);
  assert.deepEqual(ignored, [{ featureId: 'pull-up-bar', reason: 'no-matching-candidate' }]);
});

test('the latest decision wins and the superseded one is reported', () => {
  const { inventory, ignored } = confirmInventory(
    input(
      [candidate('park-bench')],
      [
        decide('park-bench', 'present', '2026-08-20T10:01:00Z'),
        decide('park-bench', 'absent', '2026-08-20T10:09:00Z'),
      ],
    ),
  );
  assert.equal(inventory.features.length, 0);
  assert.deepEqual(ignored, [{ featureId: 'park-bench', reason: 'superseded' }]);
});

test('the result does not depend on the order confirmations arrive in', () => {
  const candidates = [candidate('park-bench'), candidate('stairs'), candidate('hill')];
  const decisions = [
    decide('hill', 'present', '2026-08-20T10:03:00Z'),
    decide('park-bench', 'present', '2026-08-20T10:01:00Z'),
    decide('stairs', 'present', '2026-08-20T10:02:00Z'),
  ];
  const forward = confirmInventory(input(candidates, decisions)).inventory;
  const reversed = confirmInventory(input(candidates, [...decisions].reverse())).inventory;
  assert.deepEqual([...forward.features], [...reversed.features]);
});

test('marking a feature unusable keeps it as venue knowledge', () => {
  const { inventory } = confirmInventory(
    input([candidate('pull-up-bar')], [decide('pull-up-bar', 'present')]),
  );
  const corrected = applyCorrection(inventory, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: '2026-08-20T11:00:00Z',
    note: 'fenced off',
  });
  assert.equal(corrected.features.length, 1);
  assert.equal(corrected.features[0]?.usability.kind, 'reported-unusable');
  assert.equal(corrected.revision, inventory.revision + 1);
});

test('marking a feature absent withdraws it', () => {
  const { inventory } = confirmInventory(
    input([candidate('pull-up-bar')], [decide('pull-up-bar', 'present')]),
  );
  const corrected = applyCorrection(inventory, {
    kind: 'feature-absent',
    featureId: 'pull-up-bar',
    occurredAt: '2026-08-20T11:00:00Z',
  });
  assert.equal(corrected.features.length, 0);
});

test('a correction for a feature not in the inventory cannot add one', () => {
  const { inventory } = confirmInventory(input([candidate('park-bench')], [decide('park-bench', 'present')]));
  for (const kind of ['feature-absent', 'feature-unusable', 'feature-usable-again'] as const) {
    const corrected = applyCorrection(inventory, {
      kind,
      featureId: 'pull-up-bar',
      occurredAt: '2026-08-20T11:00:00Z',
    });
    assert.deepEqual(
      corrected.features.map((f) => f.featureId),
      ['park-bench'],
      `${kind} must not introduce a feature`,
    );
  }
});

test('usable-again clears a downgrade the user applied', () => {
  const { inventory } = confirmInventory(
    input([candidate('pull-up-bar')], [decide('pull-up-bar', 'present')]),
  );
  const down = applyCorrection(inventory, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: '2026-08-20T11:00:00Z',
  });
  const back = applyCorrection(down, {
    kind: 'feature-usable-again',
    featureId: 'pull-up-bar',
    occurredAt: '2026-08-20T12:00:00Z',
  });
  assert.equal(back.features[0]?.usability.kind, 'usable');
});

test('the generation view excludes unusable features', () => {
  const { inventory } = confirmInventory(
    input(
      [candidate('park-bench'), candidate('pull-up-bar')],
      [decide('park-bench', 'present'), decide('pull-up-bar', 'present')],
    ),
  );
  const corrected = applyCorrection(inventory, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: '2026-08-20T11:00:00Z',
  });
  assert.deepEqual([...projectGenerationView(corrected).usableFeatures], ['park-bench']);
});

test('the generation view exposes nothing but feature ids and a snapshot', () => {
  const { inventory } = confirmInventory(input([candidate('park-bench')], [decide('park-bench', 'present')]));
  assert.deepEqual(Object.keys(projectGenerationView(inventory)).sort(), [
    'snapshotId',
    'usableFeatures',
  ]);
});

test('identical usable features produce identical snapshot ids across venues', () => {
  const build = (id: string) =>
    confirmInventory({
      venueId: id as VenueId,
      candidates: [candidate('park-bench'), candidate('stairs')],
      confirmations: [decide('park-bench', 'present'), decide('stairs', 'present')],
      at: `2026-08-2${id.length}T10:06:00Z`,
    }).inventory;
  assert.equal(
    projectGenerationView(build('a')).snapshotId,
    projectGenerationView(build('bb')).snapshotId,
  );
});

test('different usable features produce different snapshot ids', () => {
  const one = confirmInventory(input([candidate('park-bench')], [decide('park-bench', 'present')])).inventory;
  const two = confirmInventory(
    input([candidate('park-bench'), candidate('stairs')], [decide('park-bench', 'present'), decide('stairs', 'present')]),
  ).inventory;
  assert.notEqual(projectGenerationView(one).snapshotId, projectGenerationView(two).snapshotId);
});

test('inventory survives a round trip through storage', () => {
  const store = createInventoryStore(createMemoryStorage());
  const { inventory } = confirmInventory(
    input([candidate('park-bench'), candidate('stairs')], [decide('park-bench', 'present'), decide('stairs', 'present')]),
  );
  store.write(venue, toPersistable(inventory));
  const text = store.read(venue);
  assert.ok(text !== null);
  const result = rehydrateInventoryFromJson(text);
  assert.ok(result.ok);
  assert.deepEqual([...result.inventory.features], [...inventory.features]);
  assert.equal(result.inventory.revision, inventory.revision);
});

test('unusable state survives a round trip', () => {
  const { inventory } = confirmInventory(input([candidate('pull-up-bar')], [decide('pull-up-bar', 'present')]));
  const corrected = applyCorrection(inventory, {
    kind: 'feature-unusable',
    featureId: 'pull-up-bar',
    occurredAt: '2026-08-20T11:00:00Z',
    note: 'flooded',
  });
  const result = rehydrateInventoryFromJson(toPersistable(corrected));
  assert.ok(result.ok);
  assert.deepEqual(result.inventory.features[0]?.usability, {
    kind: 'reported-unusable',
    reportedAt: '2026-08-20T11:00:00Z',
    note: 'flooded',
  });
});

test('untrusted persisted state is rejected rather than trusted', () => {
  const base = {
    schemaVersion: INVENTORY_SCHEMA_VERSION,
    venueId: 'v',
    revision: 1,
    updatedAt: 't',
    features: [],
  };
  const cases: readonly [unknown, string][] = [
    [null, 'malformed'],
    ['a string', 'malformed'],
    [{ ...base, schemaVersion: 99 }, 'unsupported-schema-version'],
    [{ ...base, venueId: '' }, 'malformed'],
    [{ ...base, revision: 0 }, 'malformed'],
    [{ ...base, revision: 1.5 }, 'malformed'],
    [{ ...base, features: 'nope' }, 'malformed'],
    [{ ...base, features: [{ featureId: 'trampoline', confirmedAt: 't', usability: { kind: 'usable' } }] }, 'unknown-feature-id'],
    [{ ...base, features: [{ featureId: 'bleachers', confirmedAt: 't', usability: { kind: 'usable' } }] }, 'unknown-feature-id'],
    [{ ...base, features: [{ featureId: 'park-bench', confirmedAt: 't', usability: { kind: 'maybe' } }] }, 'invalid-usability'],
    [{ ...base, features: [{ featureId: 'park-bench', confirmedAt: 't', usability: { kind: 'reported-unusable' } }] }, 'invalid-usability'],
    [
      {
        ...base,
        features: [
          { featureId: 'park-bench', confirmedAt: 't', usability: { kind: 'usable' } },
          { featureId: 'park-bench', confirmedAt: 't', usability: { kind: 'usable' } },
        ],
      },
      'duplicate-feature',
    ],
  ];
  for (const [raw, expected] of cases) {
    const result = rehydrateInventory(raw);
    assert.equal(result.ok, false, `${JSON.stringify(raw)} must be rejected`);
    if (!result.ok) assert.equal(result.failure.kind, expected, JSON.stringify(raw));
  }
});

test('a Class C object cannot be rehydrated into venue state', () => {
  const result = rehydrateInventory({
    schemaVersion: INVENTORY_SCHEMA_VERSION,
    venueId: 'v',
    revision: 1,
    updatedAt: 't',
    features: [{ featureId: 'picnic-table', confirmedAt: 't', usability: { kind: 'usable' } }],
  });
  assert.equal(result.ok, false);
});

test('unparseable storage content fails as a value, not an exception', () => {
  const result = rehydrateInventoryFromJson('{ not json');
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.failure.kind, 'unparseable');
});

test('a storage backend that throws degrades to no venue', () => {
  const hostile = {
    getItem: () => { throw new Error('disabled'); },
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('disabled'); },
  };
  const store = createInventoryStore(hostile);
  assert.equal(store.read(venue), null);
  assert.doesNotThrow(() => store.write(venue, '{}'));
});

test('confirmation is pure: no clock, no randomness, no input mutation', () => {
  const candidates = Object.freeze([candidate('park-bench')]);
  const confirmations = Object.freeze([decide('park-bench', 'present')]);

  // The whole Date constructor is replaced, not just Date.now: `new Date()`
  // reads the system clock without going through Date.now, so stubbing only
  // the static method would let a real clock read pass unnoticed.
  const realDate = globalThis.Date;
  const realRandom = Math.random;
  globalThis.Date = new Proxy(realDate, {
    construct: () => { throw new Error('clock read via new Date()'); },
    apply: () => { throw new Error('clock read via Date()'); },
    get: (target, prop, receiver) => {
      if (prop === 'now') throw new Error('clock read via Date.now');
      return Reflect.get(target, prop, receiver) as unknown;
    },
  }) as DateConstructor;
  Math.random = () => { throw new Error('randomness used'); };

  try {
    const { inventory } = confirmInventory(input(candidates, confirmations));
    const corrected = applyCorrection(inventory, {
      kind: 'feature-unusable',
      featureId: 'park-bench',
      occurredAt: '2026-08-20T11:00:00Z',
    });
    const view = projectGenerationView(inventory);
    const round = rehydrateInventoryFromJson(toPersistable(corrected));
    assert.equal(view.usableFeatures.length, 1);
    assert.equal(round.ok, true);
    assert.equal(candidates.length, 1);
  } finally {
    globalThis.Date = realDate;
    Math.random = realRandom;
  }
});
