/**
 * Marketing claim gate.
 *
 * The approved design anchor shows capabilities MoveHere does not have —
 * accounts, progress tracking, beginner-to-advanced programming, adapting to
 * how you feel, working anywhere, camera scanning. Those are classified in
 * docs/design/target-product-experience.md, and §21 requires that unauthorized
 * capability appear in neither copy nor affordance.
 *
 * Accounts are the case that needs the most care, because they are no longer
 * unauthorized. v4.5 promotes them to PLANNED: intended, and unbuilt. §22's rule
 * is that planned capability does not authorize a production affordance before
 * its minimum truthful functional implementation exists — so a Login control is
 * still forbidden, and now for a reason a reader is likelier to argue with. That
 * is exactly when a mechanical check earns its place.
 *
 * Visual review cannot enforce that reliably: a card reinstated months from now
 * looks like every other card. This asserts the forbidden claims are absent
 * from the web surface.
 *
 * Deliberately not a prose snapshot. It matches the *claims*, not the wording,
 * so copy can be rewritten freely and only a capability change trips it.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['app', 'components'];

/**
 * Comments are stripped before matching.
 *
 * The first run of this gate failed on its own explanations — a comment saying
 * why sign-in is absent contains the word, and a doc block naming progress
 * tracking as unauthorized names it. What ships to a reader is the rendered
 * copy, so that is what is checked. A comment cannot make a claim to a user.
 */
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');

/** Each rule is a claim, not a phrase. `why` is shown when it trips. */
const FORBIDDEN = [
  { claim: 'accounts / sign-in', re: /\b(sign in|sign-in|signin|log ?in|login|log ?out|create an account|my account)\b/i,
    why: 'Accounts are PLANNED, not CURRENT (§22). The control ships when it authenticates — not before.' },
  { claim: 'returning-user state', re: /\btoday.?s (session|workout)\b|\bwelcome back\b|\byour streak\b|\bsaved workouts\b/i,
    why: 'Implies an account, a history, or something already waiting. None exists (§22). Use "Example workout".' },
  { claim: 'progress tracking', re: /\b(track (your )?progress|progress tracking|see your progress|training history|workout history)\b/i,
    why: 'History and measured improvement are not implemented; no measure of improvement is defined (§18).' },
  { claim: 'measured improvement', re: /\b(get stronger over time|measure(d)? improvement|track improvement|see how you improve)\b/i,
    why: 'MoveHere records no load, reps completed or effort. The claim cannot be supported (§18).' },
  { claim: 'beginner to advanced', re: /\bbeginner to advanced\b/i,
    why: 'Advanced athletes are explicitly outside the target user (§3).' },
  { claim: 'readiness adaptation', re: /\bhow you (feel|are feeling)( that day)?\b|\breadiness\b/i,
    why: 'Adapting programming to reported feeling is a new generation-policy capability, and runs close to the medical boundary (§10).' },
  { claim: 'camera scanning', re: /\bscan (your|the) (environment|surroundings|park|space)\b|\bpoint your camera\b|\bauto(matically)? detect(s|ed)?\b/i,
    why: 'Vision inference and camera capture are not implemented (§6 step 2). Use "confirm what’s available".' },
  { claim: 'universal venue awareness', re: /\bworks (anywhere|everywhere)\b|\bany (gym|home)\b|\bparks?,? (courts|paths).{0,20}\bhome\b/i,
    why: 'Venue awareness exists for parks only. The brand line "Work out. Anywhere." is permitted; a capability claim is not.' },
  { claim: 'gps / venue discovery', re: /\b(find (parks|a park) near|nearby parks|uses your location|gps)\b/i,
    why: 'Location and GPS are out of scope (§14).' },
];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (/\.(tsx|ts)$/.test(path)) files.push(path);
  }
};
for (const root of ROOTS) walk(root);

let failed = 0;
for (const file of files) {
  const source = stripComments(readFileSync(file, 'utf8'));
  for (const rule of FORBIDDEN) {
    const hit = rule.re.exec(source);
    if (hit === null) continue;
    failed++;
    const line = source.slice(0, hit.index).split('\n').length;
    console.log(`  FAIL  ${file}:${line} — ${rule.claim}: ${JSON.stringify(hit[0])}`);
    console.log(`        ${rule.why}`);
  }
}

console.log(
  `\n  ${files.length} web source files checked, ${FORBIDDEN.length} forbidden claims, ${failed} violation${failed === 1 ? '' : 's'}`,
);
process.exit(failed === 0 ? 0 : 1);
