/**
 * The words the product uses about its own authority.
 *
 * Both clients render these strings from shared source, so they are asserted
 * once. These are §8, §9, §10 and §11 obligations expressed as copy, and copy
 * drifts more quietly than code: nothing fails to compile when a disclaimer
 * loses the word "not".
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  BOUNDARY_HEADING,
  BOUNDARY_STATEMENTS,
  NOT_MEDICAL_ADVICE,
  NO_SAFETY_ASSESSMENT,
  PROJECT_CONTENT_NOTE,
} from '../../src/presentation/safety-copy.ts';
import { SUBSTITUTE_LABEL, SUBSTITUTE_REASON } from '../../src/presentation/session-copy.ts';
import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';

/**
 * Words that must not appear in copy which has no business discussing safety.
 *
 * Deliberately not applied to the disclaimers: their entire job is to talk
 * about safety in the negative, and "Nothing here assesses whether it is safe
 * to use" contains the phrase while asserting the opposite. A word filter
 * cannot tell a refusal from a claim, so the disclaimers are asserted by their
 * required content instead, below.
 */
const SAFETY_WORDS = /\b(safe|safety|verified|certified|approved|inspected|sound|guarantee[sd]?)\b/i;

test('copy that has no business discussing safety does not mention it', () => {
  const lines = [
    PROJECT_CONTENT_NOTE,
    SUBSTITUTE_LABEL,
    ...Object.values(SUBSTITUTE_REASON),
    ...FEATURE_REGISTRY.supported.map((f) => f.confirmationPrompt),
    ...FEATURE_REGISTRY.supported.map((f) => f.label),
  ];
  for (const line of lines) {
    assert.ok(
      !SAFETY_WORDS.test(line),
      'this copy must not raise safety at all — mentioning it here invites the ' +
        `reader to infer a verdict MoveHere has not made (§9): ${line}`,
    );
  }
});

test('the provenance note names project content and withholds professional review', () => {
  assert.match(
    PROJECT_CONTENT_NOTE,
    /project-authored/i,
    'a session built from project content must say so (§8)',
  );
  assert.match(
    PROJECT_CONTENT_NOTE,
    /not programming reviewed by a qualified fitness professional/i,
    'the note must withhold the claim of professional review, not merely omit it',
  );
});

test('the standing disclaimers refuse medical and safety authority', () => {
  assert.match(NOT_MEDICAL_ADVICE, /not medical/i, 'the medical boundary must be stated (§10)');
  assert.match(
    NO_SAFETY_ASSESSMENT,
    /nothing here assesses whether it is safe/i,
    'the safety boundary must be stated in the negative (§9)',
  );
});

test('the boundary statements cover structural safety and medical scope', () => {
  assert.ok(BOUNDARY_STATEMENTS.length >= 2, 'both refusals must be stated');
  const joined = BOUNDARY_STATEMENTS.map((s) => `${s.heading} ${s.body}`).join(' ').toLowerCase();
  assert.ok(joined.includes('safe to use'), 'the structural refusal must be present (§9)');
  assert.ok(joined.includes('medical'), 'the medical refusal must be present (§10)');
  for (const s of BOUNDARY_STATEMENTS) {
    assert.ok(s.heading.length > 0 && s.body.length > 0, 'a boundary stated with no words states nothing');
  }
});

test('every substitute reason explains itself and none is empty', () => {
  const kinds = Object.keys(SUBSTITUTE_REASON);
  assert.ok(kinds.length > 0, 'a substitute must be able to say why');
  for (const [kind, reason] of Object.entries(SUBSTITUTE_REASON)) {
    assert.ok(
      reason.trim().length > 0,
      `${kind}: a substitute that announces itself with no explanation is worse than none (§11)`,
    );
  }
  assert.ok(SUBSTITUTE_LABEL.trim().length > 0, 'a substitute must carry a label (§11)');
});

test('confirmation prompts ask about existence, never about safety', () => {
  for (const feature of FEATURE_REGISTRY.supported) {
    assert.match(feature.confirmationPrompt, /\?$/, `${feature.id}: a prompt must be a question`);
  }
});

test('copy uses real characters, never HTML entities', () => {
  const entity = /&[a-z]+;|&#\d+;/i;
  const all = [
    PROJECT_CONTENT_NOTE,
    NOT_MEDICAL_ADVICE,
    NO_SAFETY_ASSESSMENT,
    BOUNDARY_HEADING,
    SUBSTITUTE_LABEL,
    ...Object.values(SUBSTITUTE_REASON),
    ...BOUNDARY_STATEMENTS.flatMap((s) => [s.heading, s.body]),
  ];
  for (const line of all) {
    assert.ok(
      !entity.test(line),
      `an entity in a JavaScript string is not markup — the user reads it literally: ${line}`,
    );
  }
});
