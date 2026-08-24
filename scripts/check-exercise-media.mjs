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

import { existsSync, readFileSync } from 'node:fs';
import { loadMatrix } from '../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../src/domain/exercise-catalog.ts';

const REGISTRY = 'mobile/media/exercise-visuals.ts';

const loaded = loadMatrix(AUTHORED_MATRIX);
if (!loaded.ok) {
  console.error('  the shipped matrix does not load; nothing can be checked against it');
  process.exit(1);
}
const matrix = loaded.matrix;

let failed = 0;

/** Each named composition in a row, so alt and asset shape can be checked. */
const compositions = (row) => {
  const found = [];
  for (const name of ['park', 'substitute']) {
    const at = row.search(new RegExp(`\\b${name}:\\s*\\{`));
    if (at === -1) continue;
    let depth = 0;
    for (let i = row.indexOf('{', at); i < row.length; i++) {
      if (row[i] === '{') depth++;
      else if (row[i] === '}') {
        depth--;
        if (depth === 0) {
          found.push([name, row.slice(at, i + 1)]);
          break;
        }
      }
    }
  }
  return found;
};

const source = readFileSync(REGISTRY, 'utf8');
/* Matched on the binding rather than on its type annotation: pinning the type
   name meant a rename made this exit 1 with "could not find the array", which
   is loud but misleading. */
const declared = /const VISUALS[^=]*=\s*\[/.exec(source);
const open = declared === null ? -1 : declared.index;
if (open === -1) {
  console.error(`  ${REGISTRY}: could not find the VISUALS array`);
  process.exit(1);
}
const body = source.slice(open, source.indexOf('\n];', open));

/**
 * Split into rows on brace depth rather than matching across the whole body.
 *
 * The previous reader was one global regex whose `[\s\S]*?` ran from an
 * exerciseId to the next featureId anywhere after it. With one row that was
 * indistinguishable from correct. With rows that now nest compositions and
 * themed pairs, a malformed row could pair its exerciseId with a *later* row's
 * featureId and validate a pairing nobody wrote, so the reader has to know
 * where a row ends.
 */
const rows = [];
{
  let depth = 0;
  let start = -1;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        rows.push(body.slice(start, i + 1));
        start = -1;
      }
    }
  }
}

const field = (row, name) => {
  const m = new RegExp(`${name}:\\s*(?:'([^']*)'|(null))`).exec(row);
  return m === null ? undefined : (m[1] ?? null);
};

const entries = rows.map((row) => ({
  row,
  exerciseId: field(row, 'exerciseId'),
  featureId: field(row, 'featureId'),
}));

/* Shape checks the pairing loop cannot make, run first so a structurally
   broken row is reported as broken rather than as an unknown exercise. */
for (const { row, exerciseId, featureId } of entries) {
  const where = `${exerciseId ?? '?'} @ ${featureId ?? '(no feature)'}`;
  if (exerciseId === undefined || exerciseId === null) {
    failed++;
    console.log('  FAIL  a registry row declares no exerciseId');
    continue;
  }
  if (featureId === undefined) {
    failed++;
    console.log(`  FAIL  ${where} — featureId must be stated, null included`);
  }
  if (!/\bpark:/.test(row)) {
    failed++;
    console.log(`  FAIL  ${where} — every entry needs a park composition`);
  }
  if (featureId !== null && /\bsubstitute:/.test(row)) {
    failed++;
    console.log(
      `  FAIL  ${where} — a feature-keyed entry may not carry a substitute ` +
        'composition; a confirmed structure exists only in a park',
    );
  }
  for (const [label, block] of compositions(row)) {
    const alt = /alt:\s*'([^']*)'/.exec(block);
    if (alt === null || alt[1].trim() === '') {
      failed++;
      console.log(`  FAIL  ${where} — the ${label} composition has no alt text`);
    }
    const neutral = /\bboth:/.test(block);
    const themed = /\blight:/.test(block) && /\bdark:/.test(block);
    if (neutral === themed) {
      failed++;
      console.log(
        `  FAIL  ${where} — the ${label} composition must declare either ` +
          '`both` or a `light`/`dark` pair, not neither and not both',
      );
    }
  }
  for (const asset of row.matchAll(/require\('([^']+)'\)/g)) {
    const resolved = new URL(`../mobile/media/${asset[1]}`, import.meta.url);
    if (!existsSync(resolved)) {
      failed++;
      console.log(`  FAIL  ${where} — asset not found: ${asset[1]}`);
    }
  }
}

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
