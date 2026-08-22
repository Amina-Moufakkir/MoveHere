/**
 * The shared presentation data both clients render features from.
 *
 * Ordering, short copy, and glyph geometry are shared so that a bench is
 * described and depicted the same way in a browser and on a phone. A gap here
 * does not fail to compile — it renders a blank label or a meaningless dash —
 * so it has to be asserted.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  PRESENTATION_ORDER,
  SHORT_HINT,
  SHORT_LABEL,
  byPresentation,
} from '../../src/presentation/feature-copy.ts';
import {
  FALLBACK_GLYPH_PATHS,
  FEATURE_GLYPH_PATHS,
  glyphPathsFor,
} from '../../src/presentation/feature-glyphs.ts';
import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';

const supported = FEATURE_REGISTRY.supported.map((f) => f.id);

test('every supported feature has a short label and hint', () => {
  for (const id of supported) {
    assert.ok(SHORT_LABEL[id], `${id}: a registry feature with no short label renders blank`);
    assert.ok(SHORT_HINT[id], `${id}: a registry feature with no hint gives the user nothing to decide on`);
  }
});

test('every supported feature has its own glyph, not the fallback', () => {
  for (const id of supported) {
    assert.ok(
      FEATURE_GLYPH_PATHS[id],
      `${id}: no glyph — the icon is how a feature is recognised at a glance, ` +
        'so falling back to a dash makes it unrecognisable on both clients',
    );
    assert.notDeepEqual(glyphPathsFor(id), FALLBACK_GLYPH_PATHS, `${id}: must not resolve to the fallback`);
  }
});

test('an unknown id still renders something rather than nothing', () => {
  assert.deepEqual(
    glyphPathsFor('not-a-feature'),
    FALLBACK_GLYPH_PATHS,
    'admitting a feature to the registry must not be blocked on drawing one first',
  );
});

test('the presentation order covers the registry exactly', () => {
  assert.deepEqual(
    [...PRESENTATION_ORDER].sort(),
    [...supported].sort(),
    'a feature missing from the order sorts last silently; an extra one orders nothing',
  );
});

test('sorting by presentation is total and stable across clients', () => {
  const sorted = [...supported].sort(byPresentation);
  assert.deepEqual(
    sorted,
    [...PRESENTATION_ORDER],
    'both clients must list features in the same order, or the same park reads differently',
  );

  const reversed = [...supported].reverse().sort(byPresentation);
  assert.deepEqual(reversed, sorted, 'the order must not depend on the order it was given');
});

test('presentation order is not registry order', () => {
  assert.notDeepEqual(
    [...PRESENTATION_ORDER],
    supported,
    'the registry is ordered by load-bearing class, which is the wrong order for ' +
      'someone standing in a park — if these coincide, one of them has drifted',
  );
});
