/**
 * Which depiction a session gets, as a decision rather than as pixels.
 *
 * The selection rule lives in shared source and is generic over the asset, so
 * it is tested with string tokens standing in for images. What is under test is
 * the rule; the native registry supplies the assets and adds no rules of its
 * own, which is what makes testing the rule equivalent to testing the screen.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  selectVisual,
  type SessionPresentation,
  type VisualEntry,
} from '../../src/presentation/exercise-visual.ts';

/* The shipped plank entry, with its assets replaced by their filenames. Kept in
   step with the registry by the last test in this file. */
const PLANK: VisualEntry<string> = {
  park: { asset: { both: 'outdoor-plank.png' }, alt: 'outdoor alt' },
  substitute: {
    asset: { light: 'indoor-daylight-plank.png', dark: 'indoor-dark-plank.png' },
    alt: 'indoor alt',
  },
  aspectRatio: 1536 / 1024,
};

const GLUTE_BRIDGE: VisualEntry<string> = {
  park: { asset: { both: 'outdoor-glute-bridge.png' }, alt: 'park glute bridge alt' },
  substitute: {
    asset: {
      light: 'indoor-daylight-glute-bridge.png',
      dark: 'indoor-dark-glute-bridge.png',
    },
    alt: 'substitute glute bridge alt',
  },
  aspectRatio: 1536 / 1024,
};

/* Feature-keyed: environment is fixed by the basis, so there is no substitute. */
const BENCH: VisualEntry<string> = {
  park: { asset: { light: 'daylight-bench.png', dark: 'dark-bench.png' }, alt: 'bench alt' },
  aspectRatio: 1536 / 1024,
};

const pick = (entry: VisualEntry<string>, session: SessionPresentation, dark: boolean) =>
  selectVisual(entry, session, dark);

/* --------------------------------------------------- the four combinations */

test('a park session gets the outdoor asset in both themes', () => {
  assert.equal(pick(PLANK, 'park', false).source, 'outdoor-plank.png');
  assert.equal(pick(PLANK, 'park', true).source, 'outdoor-plank.png');
  assert.equal(
    pick(PLANK, 'park', false).source,
    pick(PLANK, 'park', true).source,
    'theme-neutral means one asset, not two that happen to match',
  );
});

test('a substitute session selects by theme', () => {
  assert.equal(pick(PLANK, 'substitute', false).source, 'indoor-daylight-plank.png');
  assert.equal(pick(PLANK, 'substitute', true).source, 'indoor-dark-plank.png');
});

test('session and theme are independent dimensions', () => {
  // Collapsing them would give a dark-mode user in a park a depiction chosen
  // for a substitute session, which is the failure this shape exists to stop.
  const seen = new Set(
    (['park', 'substitute'] as const).flatMap((s) =>
      [false, true].map((d) => pick(PLANK, s, d).source),
    ),
  );
  assert.deepEqual(
    [...seen].sort(),
    ['indoor-dark-plank.png', 'indoor-daylight-plank.png', 'outdoor-plank.png'],
    'three assets across four combinations: the park pair collapses, the substitute pair does not',
  );
});

/* ------------------------------------------------------------ alt and ratio */

test('alt follows the selected composition, not the entry', () => {
  assert.equal(pick(PLANK, 'park', false).alt, 'outdoor alt');
  assert.equal(pick(PLANK, 'park', true).alt, 'outdoor alt');
  assert.equal(pick(PLANK, 'substitute', false).alt, 'indoor alt');
  assert.equal(pick(PLANK, 'substitute', true).alt, 'indoor alt');
});

test('aspect ratio is the selected asset’s own', () => {
  for (const session of ['park', 'substitute'] as const) {
    for (const dark of [false, true]) {
      assert.equal(pick(PLANK, session, dark).aspectRatio, 1536 / 1024);
    }
  }
});

/* ------------------------------------------------------- feature-keyed rows */

test('a feature-keyed entry cannot select a substitute presentation', () => {
  // Not a fallback ladder: the combination does not arise, because the
  // substitute pool is environment-independent. The rule stays total.
  assert.equal(BENCH.substitute, undefined);
  assert.equal(pick(BENCH, 'substitute', false).source, pick(BENCH, 'park', false).source);
  assert.equal(pick(BENCH, 'substitute', true).source, pick(BENCH, 'park', true).source);
});

/* ------------------------------------------------------------ what may vary */

test('presentation never changes media identity', () => {
  // The registry key is exercise plus cited feature. Session and theme choose
  // among depictions found under that key; they may not widen or reroute it.
  const registry = readFileSync('mobile/media/exercise-visuals.ts', 'utf8');
  const keyFn = registry.slice(registry.indexOf('const key ='), registry.indexOf('const INDEX'));
  assert.ok(
    !/session|dark|substitute|park:/i.test(keyFn),
    'the key is built from exercise and feature alone',
  );
  // Every shipped row keys on exercise and feature, whatever its variant count.
  const rows = [...registry.matchAll(/exerciseId: '([^']+)'[\s\S]*?featureId: ([^,]+),/g)];
  assert.deepEqual(
    rows.map((m) => `${m[1]}@${m[2].trim().replace(/'/g, '')}`).sort(),
    ['glute-bridge@null', 'plank@null', 'step-up@park-bench'],
  );
});

test('the domain knows nothing about any of this', () => {
  // Presentation only: no session, basis, prescription or counting concept may
  // acquire an environment or theme dimension because a picture needed one.
  const shared = readFileSync('src/presentation/exercise-visual.ts', 'utf8');
  assert.ok(!/SelectionBasis|Prescription|counting|compatib/i.test(shared));
  for (const file of ['src/domain/session.ts', 'src/domain/exercise.ts']) {
    const text = readFileSync(file, 'utf8');
    // Named precisely. "Outdoor conditions" is existing domain vocabulary about
    // weather (§11) and is not a presentation variant; what may not appear is
    // the variant type itself, or a dependency on the module that owns it.
    assert.ok(
      !/SessionPresentation/.test(text),
      `${file}: the presentation variant type must not reach the domain`,
    );
    assert.ok(
      !/exercise-visual/.test(text),
      `${file}: the domain must not depend on the visual selector`,
    );
    assert.ok(
      !/\bindoor\s+(venue|session|mode)\b/i.test(text),
      `${file}: no indoor venue concept may arrive through a picture (§12)`,
    );
  }
});

test('substitute is never described as a place', () => {
  // MoveHere has no indoor venue concept and never asks (§12). A studio-looking
  // asset for a substitute session is a presentation choice, not an inference
  // that anyone is indoors, and the shared module must not claim otherwise.
  const shared = readFileSync('src/presentation/exercise-visual.ts', 'utf8');
  const claims = shared.match(/\b(user|person|they)\b[^.]*\bis indoors\b/gi) ?? [];
  assert.deepEqual(claims, []);
});

/* ------------------------------------------------------------ glute bridge */

test('glute-bridge selects one outdoor asset for park, and by theme for substitute', () => {
  assert.equal(pick(GLUTE_BRIDGE, 'park', false).source, 'outdoor-glute-bridge.png');
  assert.equal(pick(GLUTE_BRIDGE, 'park', true).source, 'outdoor-glute-bridge.png');
  assert.equal(
    pick(GLUTE_BRIDGE, 'park', false).source,
    pick(GLUTE_BRIDGE, 'park', true).source,
    'the park composition is one asset, not two that match',
  );
  assert.equal(
    pick(GLUTE_BRIDGE, 'substitute', false).source,
    'indoor-daylight-glute-bridge.png',
  );
  assert.equal(pick(GLUTE_BRIDGE, 'substitute', true).source, 'indoor-dark-glute-bridge.png');
});

test('glute-bridge alt and ratio follow the selected composition', () => {
  assert.equal(pick(GLUTE_BRIDGE, 'park', true).alt, 'park glute bridge alt');
  assert.equal(pick(GLUTE_BRIDGE, 'substitute', true).alt, 'substitute glute bridge alt');
  for (const session of ['park', 'substitute'] as const) {
    for (const dark of [false, true]) {
      assert.equal(pick(GLUTE_BRIDGE, session, dark).aspectRatio, 1536 / 1024);
    }
  }
});

test('glute-bridge is one environment-independent media identity', () => {
  // Three assets, one key, no feature. Presentation multiplies depictions; it
  // does not multiply identities, and it introduces no compatibility claim —
  // the park composition contains a bench, a lamp post and a path as scenery,
  // and `check:exercise-media` still validates this row as feature-less.
  const registry = readFileSync('mobile/media/exercise-visuals.ts', 'utf8');
  const row = registry.slice(registry.indexOf("exerciseId: 'glute-bridge'"));
  const entry = row.slice(0, row.indexOf('\n  },'));
  assert.ok(/featureId:\s*null/.test(entry), 'glute-bridge cites no feature');
  assert.ok(!/park-bench|stairs|pull-up-bar|parallel-bars|hill/.test(entry));
  for (const file of [
    'outdoor-glute-bridge.png',
    'indoor-daylight-glute-bridge.png',
    'indoor-dark-glute-bridge.png',
  ]) {
    assert.ok(entry.includes(file), `the shipped entry must reference ${file}`);
  }
});

/* ------------------------------------------------ the fixture tracks reality */

test('the plank fixture matches the shipped registry', () => {
  const registry = readFileSync('mobile/media/exercise-visuals.ts', 'utf8');
  const row = registry.slice(registry.indexOf("exerciseId: 'plank'"));
  const entry = row.slice(0, row.indexOf('\n  },'));
  for (const file of ['outdoor-plank.png', 'indoor-daylight-plank.png', 'indoor-dark-plank.png']) {
    assert.ok(entry.includes(file), `the shipped plank entry must reference ${file}`);
  }
  assert.ok(/park:\s*\{\s*asset:\s*\{\s*both:/.test(entry), 'the park composition is theme-neutral');
  assert.ok(/substitute:[\s\S]*light:[\s\S]*dark:/.test(entry), 'the substitute composition is themed');
});
