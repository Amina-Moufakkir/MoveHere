/**
 * Negative contract test harness.
 *
 * Each file in tests/contracts/negative/ encodes one thing the domain must make
 * impossible, and declares the TypeScript error it expects:
 *
 *     // @expect TS2322 spreading an inventory cannot inject a feature
 *
 * The suite passes when every file fails to compile with its expected error
 * code, and no negative file compiles clean. A file that starts compiling is a
 * regression: an invariant stopped being enforced.
 *
 * No test-runner dependency. Node plus tsc, both already required.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'tests/contracts/negative';
const EXPECT = /^\/\/ @expect (TS\d+)\s+(.*)$/;

const files = readdirSync(DIR).filter((f) => f.endsWith('.ts')).sort();
if (files.length === 0) {
  console.error('No negative contract tests found.');
  process.exit(1);
}

const expected = new Map();
for (const file of files) {
  const codes = readFileSync(join(DIR, file), 'utf8')
    .split('\n')
    .map((line) => EXPECT.exec(line.trim()))
    .filter(Boolean)
    .map((m) => ({ code: m[1], description: m[2] }));
  if (codes.length === 0) {
    console.error(`${file}: no // @expect annotation`);
    process.exit(1);
  }
  expected.set(file, codes);
}

let output = '';
try {
  execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.negative.json'], { encoding: 'utf8' });
} catch (err) {
  output = `${err.stdout ?? ''}${err.stderr ?? ''}`;
}

const actual = new Map(files.map((f) => [f, new Set()]));
for (const line of output.split('\n')) {
  const m = /^(?:.*[/\\])?([\w.-]+\.ts)\((\d+),\d+\): error (TS\d+):/.exec(line);
  if (!m) continue;
  const [, file, , code] = m;
  if (actual.has(file)) actual.get(file).add(code);
  else {
    console.error(`Unexpected error in a non-test file: ${line}`);
    process.exit(1);
  }
}

let failed = 0;
for (const [file, cases] of expected) {
  const got = actual.get(file);
  for (const { code, description } of cases) {
    if (got.has(code)) {
      console.log(`  ok    ${file} — ${description}`);
    } else {
      failed++;
      const detail = got.size === 0 ? 'compiled clean' : `got ${[...got].join(', ')}`;
      console.log(`  FAIL  ${file} — expected ${code}, ${detail}`);
      console.log(`        invariant not enforced: ${description}`);
    }
  }
}

const total = [...expected.values()].reduce((n, c) => n + c.length, 0);
console.log(`\n${total - failed}/${total} invariants enforced`);
process.exit(failed === 0 ? 0 : 1);
