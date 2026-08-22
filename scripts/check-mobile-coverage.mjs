/**
 * Mobile typecheck coverage gate.
 *
 * mobile/tsconfig.json once included only "*.ts" and "*.tsx" — a glob written
 * when the whole native app was a single App.tsx at the project root. It went on
 * passing after the screens moved into app/, checking shared src/ and nothing
 * else, so an entire client's worth of code was unverified while the command
 * still reported success. A typecheck that silently stops covering things is
 * worse than no typecheck, because it is trusted.
 *
 * This asserts every authored file under mobile/ is matched by at least one
 * include pattern. It answers the question the tsconfig cannot answer about
 * itself: not "do these globs resolve" but "do they reach everything we wrote".
 *
 * Deliberately pattern-based rather than shelling out to tsc --listFiles: this
 * runs in root CI, where mobile/node_modules does not exist.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'mobile';
const SKIP = new Set(['node_modules', '.expo', 'dist', 'ios', 'android', 'spike-dist']);
const SOURCE = /\.(ts|tsx)$/;

/**
 * JSON with comments — tsconfig allows them, JSON.parse does not.
 *
 * String-aware on purpose. A naive regex strips from the first `//` it sees,
 * which mangles a `"//"` documentation key or any URL in a value — this file's
 * own first attempt did exactly that.
 */
const stripComments = (raw) => {
  let out = '';
  let inString = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inString) {
      out += c;
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      out += c;
      continue;
    }
    if (c === '/' && raw[i + 1] === '/') {
      while (i < raw.length && raw[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (c === '/' && raw[i + 1] === '*') {
      i += 2;
      while (i < raw.length && !(raw[i] === '*' && raw[i + 1] === '/')) i++;
      i++;
      continue;
    }
    out += c;
  }
  return out;
};

const readTsconfig = (path) => JSON.parse(stripComments(readFileSync(path, 'utf8')));

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    if (SKIP.has(entry)) return [];
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

/** Minimal tsconfig glob semantics: ** spans directories, * does not. */
const toRegExp = (pattern) => {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        out += '.*';
        i++;
        if (pattern[i + 1] === '/') i++;
      } else {
        out += '[^/]*';
      }
    } else if (c === '.') out += '\\.';
    else if (c === '?') out += '[^/]';
    else out += c;
  }
  // A directory pattern with no extension implies everything beneath it.
  if (!/\.\w+$/.test(pattern) && !pattern.endsWith('*')) out += '(/.*)?';
  return new RegExp(`^${out}$`);
};

const config = readTsconfig(join(ROOT, 'tsconfig.json'));
const include = config.include ?? [];
if (include.length === 0) {
  console.error(`  ${ROOT}/tsconfig.json declares no include patterns`);
  process.exit(1);
}
const patterns = include.map(toRegExp);

const authored = walk(ROOT).filter((f) => SOURCE.test(f));
if (authored.length === 0) {
  console.error(`  no authored source found under ${ROOT}/ — the walk is wrong`);
  process.exit(1);
}

const uncovered = authored.filter((file) => {
  const rel = relative(ROOT, file);
  return !patterns.some((p) => p.test(rel));
});

for (const file of uncovered) {
  console.log(`  FAIL  ${file} — authored but matched by no include pattern`);
}

const covered = authored.length - uncovered.length;
console.log(
  `\n  ${covered}/${authored.length} authored mobile files covered by the mobile typecheck`,
);
process.exit(uncovered.length === 0 ? 0 : 1);
