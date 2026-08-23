/**
 * Movement instruction coverage.
 *
 * Reports how many movements have written instructions, how many were decided
 * to need none, and how many are still outstanding.
 *
 * Outstanding is not a failure. It is the honest state of a catalog whose
 * instruction content has not been authored yet, and the point of reporting it
 * is that "not written" stays visible instead of looking like "not needed".
 *
 * What would be a failure is a malformed instruction, and that is caught a
 * layer down: the matrix does not load at all if an authored instruction is
 * missing its setup or action step. This script only counts what loaded.
 *
 * Deterministic: movements are reported in catalog order, and every count is a
 * pure function of the shipped content.
 */

import { execFileSync } from 'node:child_process';

const script = `
import { loadMatrix } from './src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from './src/domain/exercise-catalog.ts';

const m = loadMatrix(AUTHORED_MATRIX);
if (!m.ok) {
  console.error('  matrix failed to load; instruction coverage is unknowable:');
  for (const f of m.failures) console.error('   ', JSON.stringify(f));
  process.exit(1);
}

const buckets = { authored: [], 'not-required': [], outstanding: [] };
for (const e of m.matrix.exercises) buckets[e.instructions.kind].push(String(e.id));

const total = m.matrix.exercises.length;
for (const kind of ['authored', 'not-required', 'outstanding']) {
  const ids = buckets[kind];
  console.log('  ' + String(ids.length).padStart(3) + '  ' + kind);
  for (const id of ids) console.log('        ' + id);
}

// Context coverage. An authored instruction declares the context it constructs;
// every other cited context either overrides a phase or inherits the default,
// and inheriting is a decision worth seeing rather than a silence.
let overrides = 0;
const inherited = m.advisories.filter((a) => a.kind === 'instruction-context-inherits-default');
for (const e of m.matrix.exercises) {
  if (e.instructions.kind !== 'authored') continue;
  const list = e.instructions.overrides ?? [];
  overrides += list.length;
  const ctx = e.instructions.defaultContext;
  const label = ctx.kind === 'confirmed-feature' ? String(ctx.featureId) : 'environment-independent';
  console.log('        ' + String(e.id) + '  default=' + label + '  overrides=' + list.length);
}
for (const a of inherited) {
  console.log('  inherit  ' + String(a.exerciseId) + ' @ ' + a.featureId + ' reads the default instruction');
}

console.log(
  '\\n  ' + buckets.authored.length + '/' + total + ' movements have authored instructions, ' +
  buckets['not-required'].length + ' need none by decision, ' +
  buckets.outstanding.length + ' outstanding; ' +
  overrides + ' context overrides, ' + inherited.length + ' contexts inheriting the default'
);
`;

try {
  const out = execFileSync(
    process.execPath,
    ['--experimental-strip-types', '--input-type=module', '--eval', script],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  process.stdout.write(out);
} catch (err) {
  process.stdout.write(err.stdout ?? '');
  process.stderr.write(err.stderr ?? '');
  process.exit(1);
}
