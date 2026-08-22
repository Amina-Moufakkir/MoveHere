/**
 * Exercise-media compatibility gate.
 *
 * A registry entry says "this is what that movement looks like on that
 * structure". It must never be the thing that *establishes* the pairing —
 * generation decides what is possible from the compatibility matrix, and a
 * depiction only illustrates a claim the matrix already holds.
 *
 * Without this, adding a visual is a way to assert compatibility by drawing it:
 * a bench picture keyed to an exercise the matrix never allowed on a bench
 * would show a user a movement the generator would never give them, on a
 * structure nobody authorised. That is the same class of error as a Class C
 * object reaching confirmed inventory, arriving through the art pipeline.
 *
 * Static rather than importing the registry: it lives in the native client and
 * `require`s image assets, which is bundler semantics this cannot run.
 */

import { readFileSync } from 'node:fs';
import { loadMatrix } from '../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../src/domain/exercise-catalog.ts';

const REGISTRY = 'mobile/media/exercise-visuals.ts';

const loaded = loadMatrix(AUTHORED_MATRIX);
if (!loaded.ok) {
  console.error('  the shipped matrix does not load; nothing can be checked against it');
  process.exit(1);
}
const matrix = loaded.matrix;

const source = readFileSync(REGISTRY, 'utf8');
const open = source.indexOf('const VISUALS: readonly VisualEntry[] = [');
if (open === -1) {
  console.error(`  ${REGISTRY}: could not find the VISUALS array`);
  process.exit(1);
}
const body = source.slice(open, source.indexOf('\n];', open));

const ENTRY = /exerciseId:\s*'([^']+)'[\s\S]*?featureId:\s*(?:'([^']+)'|(null))/g;
const entries = [...body.matchAll(ENTRY)].map((m) => ({
  exerciseId: m[1],
  featureId: m[2] ?? null,
}));

let failed = 0;
for (const { exerciseId, featureId } of entries) {
  const exercise = matrix.exercises.find((e) => String(e.id) === exerciseId);
  if (exercise === undefined) {
    failed++;
    console.log(`  FAIL  ${exerciseId} — no such exercise in the validated matrix`);
    continue;
  }

  if (featureId === null) {
    const declared = matrix.environmentIndependent.some(
      (d) => String(d.exerciseId) === exerciseId,
    );
    if (!declared) {
      failed++;
      console.log(
        `  FAIL  ${exerciseId} @ (no feature) — depicted as needing nothing, but the ` +
          'matrix holds no environment-independent declaration for it',
      );
      continue;
    }
    console.log(`  ok    ${exerciseId} @ (no feature)`);
    continue;
  }

  const claimed = matrix.compatibilities.some(
    (c) => String(c.exerciseId) === exerciseId && String(c.featureId) === featureId,
  );
  if (!claimed) {
    failed++;
    console.log(
      `  FAIL  ${exerciseId} @ ${featureId} — the matrix does not hold this ` +
        'compatibility; a visual may illustrate a claim, never create one',
    );
    continue;
  }
  console.log(`  ok    ${exerciseId} @ ${featureId}`);
}

console.log(
  `\n  ${entries.length - failed}/${entries.length} exercise visuals map to a real compatibility claim`,
);
process.exit(failed === 0 ? 0 : 1);
