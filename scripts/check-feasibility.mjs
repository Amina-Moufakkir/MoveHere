/**
 * Content feasibility gate.
 *
 * Loads the shipped matrix and policies, checks them against each other, and
 * fails the build on any error. This is what makes "the user received no
 * session" a content defect caught in CI rather than a runtime outcome.
 *
 * Advisories are printed but do not fail: they describe real content gaps
 * (pull has no environment-independent option) rather than defects.
 */

import { execFileSync } from 'node:child_process';

const script = `
import { loadMatrix } from './src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from './src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from './src/domain/policy-loader.ts';
import { AUTHORED_POLICIES } from './src/domain/policy-catalog.ts';
import { checkFeasibility } from './src/domain/feasibility.ts';

const m = loadMatrix(AUTHORED_MATRIX);
if (!m.ok) {
  console.error('  matrix failed to load:');
  for (const f of m.failures) console.error('   ', JSON.stringify(f));
  process.exit(1);
}
const p = loadGoalPolicies(AUTHORED_POLICIES);
if (!p.ok) {
  console.error('  policies failed to load:');
  for (const f of p.failures) console.error('   ', JSON.stringify(f));
  process.exit(1);
}

const result = checkFeasibility(m.matrix, p.policies);

for (const a of result.advisories) console.log('  advisory  ' + JSON.stringify(a));
for (const d of m.dropped) console.log('  dropped   ' + JSON.stringify(d));
for (const d of p.dropped) console.log('  dropped   ' + JSON.stringify(d));

if (!result.ok) {
  console.error('\\n  INFEASIBLE:');
  for (const e of result.errors) console.error('   ' + JSON.stringify(e));
  process.exit(1);
}

console.log(
  '\\n  feasible — matrix ' + m.matrix.version +
  ' (' + m.matrix.authorityTier + '), policies ' + p.policies.authorityTier +
  ', ' + result.advisories.length + ' advisories'
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
