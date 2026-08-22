/**
 * Palette drift gate.
 *
 * The Daylight colour values live in src/design/palette.ts and are consumed
 * directly by the native client. The web client keeps its own @theme block,
 * deliberately: rewriting a released stylesheet to import a token module would
 * risk visual regression for purity nobody can evaluate (§15).
 *
 * That leaves two representations of the same values, which is acceptable only
 * while they cannot diverge unnoticed. This asserts every colour in the
 * stylesheet matches the shared palette, and that neither side has a colour the
 * other lacks.
 *
 * No test-runner dependency. Node plus a regex over a file we control.
 */

import { readFileSync } from 'node:fs';

const CSS = 'app/globals.css';
const DECL = /^\s*(--color-[a-z-]+):\s*light-dark\(\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)\s*;/;

const { DAYLIGHT_PALETTE, cssVarName } = await import('../src/design/palette.ts');

const fromCss = new Map();
for (const line of readFileSync(CSS, 'utf8').split('\n')) {
  const m = DECL.exec(line);
  if (m) fromCss.set(m[1], { light: m[2].toLowerCase(), dark: m[3].toLowerCase() });
}

if (fromCss.size === 0) {
  console.error(`  no light-dark() colour declarations found in ${CSS}`);
  process.exit(1);
}

let failed = 0;
const seen = new Set();

for (const [name, pair] of Object.entries(DAYLIGHT_PALETTE)) {
  const varName = cssVarName(name);
  seen.add(varName);
  const css = fromCss.get(varName);
  if (css === undefined) {
    failed++;
    console.log(`  FAIL  ${varName} — in the shared palette, missing from ${CSS}`);
    continue;
  }
  if (css.light !== pair.light.toLowerCase() || css.dark !== pair.dark.toLowerCase()) {
    failed++;
    console.log(
      `  FAIL  ${varName} — css light-dark(${css.light}, ${css.dark}) ` +
        `!= shared light-dark(${pair.light}, ${pair.dark})`,
    );
  }
}

for (const varName of fromCss.keys()) {
  if (!seen.has(varName)) {
    failed++;
    console.log(`  FAIL  ${varName} — declared in ${CSS}, missing from the shared palette`);
  }
}

const total = Object.keys(DAYLIGHT_PALETTE).length;
console.log(`\n  ${total - failed}/${total} Daylight colours agree between the stylesheet and shared source`);
process.exit(failed === 0 ? 0 : 1);
