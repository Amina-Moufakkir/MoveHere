/**
 * The instruction surface, as a decision rather than as pixels (§8).
 *
 * Whether a person is offered instructions, and what they read, is content
 * logic — so it lives in shared source and is tested here. The native sheet
 * renders what this produces and adds no rules of its own, which is what makes
 * testing the decision equivalent to testing the behaviour.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX, EXERCISES } from '../../src/domain/exercise-catalog.ts';
import { resolveInstructions } from '../../src/domain/instruction-resolution.ts';
import {
  CUES_HEADING,
  INSTRUCTION_HEADING,
  instructionPanel,
} from '../../src/presentation/instruction-copy.ts';
import { PROJECT_CONTENT_NOTE } from '../../src/presentation/safety-copy.ts';
import type { AuthoredMatrix, Exercise, InstructionState } from '../../src/domain/exercise.ts';
import type { SelectionBasis } from '../../src/domain/session.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';

const matrix = (() => {
  const r = loadMatrix(AUTHORED_MATRIX);
  assert.ok(r.ok);
  return r.matrix;
})();

const find = (id: string): Exercise => {
  const e = matrix.exercises.find((x) => String(x.id) === id);
  assert.ok(e !== undefined, `${id} must exist`);
  return e;
};

const eiBasis: SelectionBasis = {
  kind: 'environment-independent',
  declarationId: 'ei-x' as never,
  authority: { matrixVersion: '1' as never, tier: 'project-content', attestedAt: 't' },
};
const featureBasis = (featureId: string): SelectionBasis => ({
  kind: 'confirmed-feature',
  featureId: featureId as SupportedFeatureId,
  compatibilityId: 'x' as never,
  authority: { matrixVersion: '1' as never, tier: 'project-content', attestedAt: 't' },
});

const panelFor = (id: string, basis: SelectionBasis = eiBasis) =>
  instructionPanel(resolveInstructions(find(id), basis));

/* ------------------------------------------------------------ affordance */

test('an authored instruction offers the affordance', () => {
  for (const id of ['glute-bridge', 'plank', 'bodyweight-squat']) {
    const panel = panelFor(id);
    assert.equal(panel.kind, 'available', `${id} is authored and must offer instructions`);
  }
});

test('an outstanding instruction offers nothing at all', () => {
  const outstanding = matrix.exercises.filter((e) => e.instructions.kind === 'outstanding');
  assert.ok(outstanding.length > 0, 'the catalog must still contain outstanding movements');
  for (const e of outstanding) {
    assert.deepEqual(
      panelFor(String(e.id)),
      { kind: 'hidden' },
      `${String(e.id)}: outstanding renders no affordance and no message about its absence`,
    );
  }
});

test('a not-required movement offers nothing, in shipped content', () => {
  // brisk-walk and easy-run carry a decided not-required state. This runs
  // against the real catalog rather than a fixture: the point of the state is
  // that a decision was made about real content, and a fixture cannot show it
  // was.
  const decided = matrix.exercises.filter((e) => e.instructions.kind === 'not-required');
  assert.deepEqual(decided.map((e) => String(e.id)).sort(), ['brisk-walk', 'easy-run']);
  for (const e of decided) {
    assert.deepEqual(
      panelFor(String(e.id)),
      { kind: 'hidden' },
      `${String(e.id)}: a decided not-required renders no section and no explanation of its absence`,
    );
  }
});

test('hidden is indistinguishable between outstanding and not-required', () => {
  // The distinction is real and belongs in the content records. On screen it
  // would be an announcement about internal completeness to someone mid-workout.
  // Both sides are shipped content now, so this compares what a user meets.
  const outstanding = panelFor('pike-push-up');
  const decided = panelFor('brisk-walk');
  assert.equal(find('pike-push-up').instructions.kind, 'outstanding');
  assert.equal(find('brisk-walk').instructions.kind, 'not-required');
  assert.deepEqual(outstanding, decided);
});

test('a not-required movement still carries its cues', () => {
  // not-required removes the instruction, not the coaching. For these
  // movements the cues are the only coaching content a user sees, which is
  // what makes cue provenance matter more here, not less — and which this
  // state decision does not address either way.
  for (const id of ['brisk-walk', 'easy-run']) {
    assert.ok(find(id).cues.length > 0, `${id}: cues are the remaining coaching surface`);
  }
});

/* ----------------------------------------------------------------- content */

test('authored step order is preserved exactly', () => {
  const panel = panelFor('glute-bridge');
  assert.ok(panel.kind === 'available');
  const authored = find('glute-bridge').instructions;
  assert.ok(authored.kind === 'authored');
  assert.deepEqual(
    [...panel.steps],
    authored.steps.map((s) => s.text),
    'the surface renders authored order, unreordered and unfiltered',
  );
});

test('the panel carries no phase labels', () => {
  // setup/action/return prove an instruction is complete; they are not how a
  // person reads one, and they do not survive this boundary.
  for (const id of ['glute-bridge', 'plank', 'bodyweight-squat']) {
    const panel = panelFor(id);
    assert.ok(panel.kind === 'available');
    for (const step of panel.steps) {
      assert.equal(typeof step, 'string');
      for (const phase of ['setup', 'action', 'return']) {
        assert.ok(
          !step.toLowerCase().startsWith(phase),
          `${id}: a step must not be prefixed with its schema phase`,
        );
      }
    }
  }
});

test('no cue, prescription, or counting content reaches the instruction surface', () => {
  for (const id of ['glute-bridge', 'plank', 'bodyweight-squat']) {
    const exercise = find(id);
    const panel = panelFor(id);
    assert.ok(panel.kind === 'available');
    const text = panel.steps.join(' ');

    for (const cue of exercise.cues) {
      assert.ok(!text.includes(cue), `${id}: cue text must not appear in instructions`);
    }
    for (const phrase of ['per side', 'switch sides', 'each side', 'reps', 'sets', 'seconds']) {
      assert.ok(
        !text.toLowerCase().includes(phrase),
        `${id}: "${phrase}" belongs to the prescription, not the instruction`,
      );
    }
    assert.ok(!/\d+\s*(×|x)\s*\d+/.test(text), `${id}: no dose may be rendered here`);
  }
});

/* ------------------------------------------------------------- generality */

test('the surface is decided generically, with no exercise named', () => {
  // Every movement in the catalog resolves through the same call, and the
  // outcome follows only from its instruction state.
  for (const e of matrix.exercises) {
    const panel = panelFor(String(e.id));
    const expected = e.instructions.kind === 'authored' ? 'available' : 'hidden';
    assert.equal(panel.kind, expected, `${String(e.id)}: decided by state, not by identity`);
  }
});

test('a context-resolved instruction needs no different handling', () => {
  // Proves the surface is ready for split squat before it is authored: an
  // overridden setup arrives here as an ordinary ordered list.
  const overridden: InstructionState = {
    kind: 'authored',
    defaultContext: { kind: 'environment-independent' },
    steps: [
      { kind: 'setup', text: 'Stagger your stance with the rear foot on the ground.' },
      { kind: 'action', text: 'Lower straight down.' },
      { kind: 'return', text: 'Press back up.' },
    ],
    overrides: [
      {
        featureId: 'park-bench' as SupportedFeatureId,
        replaces: 'setup',
        steps: [{ kind: 'setup', text: 'Stagger your stance with the rear foot on the bench.' }],
        authority: { status: 'project-content', authoredAt: 't', basisRefs: ['x'] },
      },
    ],
    authority: { status: 'project-content', authoredAt: 't', basisRefs: ['x'] },
  };
  const patched: AuthoredMatrix = {
    ...AUTHORED_MATRIX,
    exercises: EXERCISES.map((e): Exercise =>
      String(e.id) === 'split-squat' ? { ...e, instructions: overridden } : e,
    ),
  };
  const r = loadMatrix(patched);
  assert.ok(r.ok);
  const squat = r.matrix.exercises.find((e) => String(e.id) === 'split-squat');
  assert.ok(squat !== undefined);

  const ground = instructionPanel(resolveInstructions(squat, eiBasis));
  const bench = instructionPanel(resolveInstructions(squat, featureBasis('park-bench')));
  assert.ok(ground.kind === 'available' && bench.kind === 'available');

  assert.equal(ground.steps.length, bench.steps.length, 'same shape, different first step');
  assert.match(ground.steps[0]!, /on the ground/);
  assert.match(bench.steps[0]!, /on the bench/);
  assert.deepEqual(ground.steps.slice(1), bench.steps.slice(1));
});

/* ---------------------------------------------------------- accessibility */

test('instructions are a section, not a control', () => {
  // They render inline in the workout content. There is no affordance to
  // label and nothing to dismiss, so the surface exposes a heading and steps
  // and nothing else — a client has no decision left to make about them.
  assert.ok(INSTRUCTION_HEADING.length > 0, 'the section needs a heading');
  const panel = panelFor('plank');
  assert.ok(panel.kind === 'available');
  assert.deepEqual(Object.keys(panel).sort(), ['kind', 'steps']);
});

test('cues and instructions are separately headed', () => {
  assert.notEqual(
    CUES_HEADING,
    INSTRUCTION_HEADING,
    'two different jobs must not read as one block',
  );
});

/* --------------------------------------------------------------- provenance */

test('the provenance note covers instructions now that they are visible', () => {
  assert.match(PROJECT_CONTENT_NOTE, /movement instructions/i);
  assert.match(PROJECT_CONTENT_NOTE, /has not been reviewed by a qualified fitness professional/i);
  assert.ok(
    !/feature-use/i.test(PROJECT_CONTENT_NOTE),
    'the note names only content that exists; feature-use checks are unbuilt',
  );
});
