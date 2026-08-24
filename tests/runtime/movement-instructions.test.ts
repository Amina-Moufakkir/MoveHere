/**
 * Movement instructions — the contract and its validation boundary (§8).
 *
 * Pass 1 adds the model, not the content. These tests check what the loader
 * refuses and what it lets through; there is nothing authored yet to check the
 * quality of.
 *
 * The distinction under test throughout: an instruction is ordered and
 * constructive, addressed to someone who has never performed the movement.
 * Cues are unordered and corrective, addressed to someone already doing it.
 * Nothing here touches `cues`.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { loadMatrix } from '../../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX, EXERCISES } from '../../src/domain/exercise-catalog.ts';
import type {
  AuthoredMatrix,
  Exercise,
  InstructionState,
  MovementStep,
  PresentableAuthority,
} from '../../src/domain/exercise.ts';

const PROJECT: PresentableAuthority = {
  status: 'project-content',
  authoredAt: '2026-08-23',
  basisRefs: ['test basis'],
};

const step = (kind: MovementStep['kind'], text: string): MovementStep => ({ kind, text });

/** Replaces the first exercise's instruction state, leaving everything else. */
const withInstructions = (state: InstructionState): AuthoredMatrix => {
  const [first, ...rest] = EXERCISES;
  assert.ok(first !== undefined);
  const patched: Exercise = { ...first, instructions: state };
  return { ...AUTHORED_MATRIX, exercises: [patched, ...rest] };
};

const failureKinds = (result: ReturnType<typeof loadMatrix>): readonly string[] =>
  result.ok ? [] : result.failures.map((f) => f.kind);

/* ------------------------------------------------------ the three states */

test('every movement declares an instruction state, and not-required is named', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  const kinds = result.matrix.exercises.map((e) => e.instructions.kind);
  assert.equal(kinds.length, 23);
  assert.ok(kinds.every((k) => k === 'authored' || k === 'not-required' || k === 'outstanding'));

  // `not-required` is a deliberate content decision and may never arrive by
  // default or by inference from missing evidence (§8). Named rather than
  // counted, so a movement cannot drift into this state because nobody wrote
  // its instruction — which is the failure the state exists to make visible.
  const decided = result.matrix.exercises
    .filter((e) => e.instructions.kind === 'not-required')
    .map((e) => String(e.id))
    .sort();
  assert.deepEqual(decided, ['brisk-walk', 'easy-run']);
});

test('each not-required decision states a reason', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  for (const e of result.matrix.exercises) {
    if (e.instructions.kind !== 'not-required') continue;
    const reason = e.instructions.reason;
    assert.ok(reason.trim().length > 0, `${String(e.id)}: a decision must say why`);
    // The reason is a product decision about the contract's fit, and is not
    // evidence. It must not read as a claim about the movement's difficulty or
    // about what a reader already knows.
    assert.ok(
      !/everyone knows|obvious|simple|easy to|no technique|anyone can/i.test(reason),
      `${String(e.id)}: the reason must not rest on assumed reader knowledge or simplicity`,
    );
  }
});

test('outstanding and not-required stay distinguishable', () => {
  const outstanding = loadMatrix(withInstructions({ kind: 'outstanding' }));
  const decided = loadMatrix(
    withInstructions({ kind: 'not-required', reason: 'walking needs no written instruction' }),
  );
  assert.ok(outstanding.ok);
  assert.ok(decided.ok);

  const kindOf = (r: typeof outstanding) =>
    r.ok ? r.matrix.exercises[0]?.instructions.kind : null;

  assert.equal(kindOf(outstanding), 'outstanding');
  assert.equal(kindOf(decided), 'not-required');
  assert.notEqual(
    kindOf(outstanding),
    kindOf(decided),
    'a decision that none is needed must never look like one nobody has made yet',
  );
});

test('not-required must say why', () => {
  const blank = loadMatrix(withInstructions({ kind: 'not-required', reason: '   ' }));
  assert.ok(!blank.ok);
  assert.ok(failureKinds(blank).includes('empty-collection'));
});

/* ------------------------------------------------- authored step structure */

test('an authored instruction needs a setup step', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [step('action', 'Lower your chest to the ground'), step('return', 'Press back up')],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(failureKinds(result).includes('instruction-missing-required-step'));
  if (result.ok) return;
  const failure = result.failures.find((f) => f.kind === 'instruction-missing-required-step');
  assert.ok(failure !== undefined && 'missing' in failure);
  assert.deepEqual(failure.missing, ['setup'], 'the report names what is missing');
});

test('an authored instruction needs an action step', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [step('setup', 'Stand with your feet about shoulder width apart')],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(failureKinds(result).includes('instruction-missing-required-step'));
});

test('a static hold needs no return step', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Lie face down and place your forearms under your shoulders'),
        step('action', 'Lift your hips until your body is in one line, and hold'),
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(result.ok, 'a held position has no repetition to complete');
});

test('an authored instruction with all three kinds loads', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand with your feet about shoulder width apart'),
        step('action', 'Sit back and down until your thighs are near parallel'),
        step('return', 'Push through the floor and stand tall'),
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(result.ok);
});

test('a step may not be blank', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [step('setup', '   '), step('action', 'Sit back and down')],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(failureKinds(result).includes('empty-collection'));
});

/* ------------------------------------------------------------- authority */

test('an authored instruction carries its own sourced authority', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [step('setup', 'Stand tall'), step('action', 'Sit back and down')],
      authority: { status: 'project-content', authoredAt: '2026-08-23', basisRefs: [] as never },
    }),
  );
  assert.ok(!result.ok);
  assert.ok(
    failureKinds(result).includes('unsourced-content'),
    'an instruction inherits nothing from the exercise it describes, including its sources',
  );
});

/* ------------------------------------------------------ counting boundary */

test('instruction text may not state how a prescribed number is counted', () => {
  for (const text of [
    'Complete all reps on one side, then switch sides',
    'Hold for the prescribed time per side',
    'Do the same number each side',
    'Repeat on the other side',
  ]) {
    const result = loadMatrix(
      withInstructions({
        kind: 'authored',
        defaultContext: { kind: 'environment-independent' },
        steps: [step('setup', 'Stagger your stance'), step('action', text)],
        authority: PROJECT,
      }),
    );
    assert.ok(!result.ok, `must reject: ${text}`);
    assert.ok(
      failureKinds(result).includes('instruction-states-counting'),
      `counting belongs to the prescription, not the text: ${text}`,
    );
  }
});

test('describing the body is not stating a count', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand tall with your weight on one leg'),
        step('action', 'Step back with your other leg and lower your hips'),
        step('return', 'Push through the front foot to stand'),
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(result.ok, 'anatomy is not counting; the check must stay narrow enough to allow it');
});

/* ---------------------------------------------------------- malformedness */

test('a malformed instruction state is reported, not thrown on', () => {
  // Authored content is untrusted at this boundary, so a state the type
  // promises may still arrive wrong. A loader that crashes on malformed
  // content cannot report malformed content.
  for (const bad of [null, undefined, {}, { kind: 'invented' }, 'authored']) {
    const result = loadMatrix(
      withInstructions(bad as unknown as InstructionState),
    );
    assert.ok(!result.ok, `must reject: ${JSON.stringify(bad)}`);
    assert.ok(failureKinds(result).includes('malformed'));
  }
});

test('a malformed step is reported, not thrown on', () => {
  const result = loadMatrix(
    withInstructions({
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand tall'),
        { kind: 'cue', text: 'Elbows back' } as unknown as MovementStep,
        step('action', 'Sit back and down'),
      ],
      authority: PROJECT,
    }),
  );
  assert.ok(!result.ok);
  assert.ok(failureKinds(result).includes('malformed'));
});

/* ------------------------------------------------------------- coverage */

test('instruction coverage is reportable across every movement', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  const counts = { authored: 0, 'not-required': 0, outstanding: 0 };
  for (const e of result.matrix.exercises) counts[e.instructions.kind]++;
  assert.equal(
    counts.authored + counts['not-required'] + counts.outstanding,
    result.matrix.exercises.length,
    'every movement falls in exactly one bucket',
  );
  assert.equal(counts['not-required'], 2);

  // Named rather than counted: which movements carry instructions is a content
  // decision, and a batch that quietly authored a fourth should say so here.
  const authored = result.matrix.exercises
    .filter((e) => e.instructions.kind === 'authored')
    .map((e) => String(e.id))
    .sort();
  assert.deepEqual(authored, [
    'bodyweight-squat',
    'dead-bug',
    'glute-bridge',
    'hip-hinge',
    'plank',
    'pull-up',
    'push-up',
    'reverse-lunge',
    'side-plank',
    'single-leg-deadlift',
    'split-squat',
    'step-up',
  ]);
});

test('every authored instruction rests on its own project-content basis', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  for (const e of result.matrix.exercises) {
    if (e.instructions.kind !== 'authored') continue;
    const authority = e.instructions.authority;
    assert.equal(
      authority.status,
      'project-content',
      `${String(e.id)}: source-grounding does not promote authority (§8)`,
    );
    assert.ok(
      authority.status === 'project-content' && authority.basisRefs.length > 0,
      `${String(e.id)}: an instruction must name what it rests on`,
    );
  }
});

test('no authored instruction borrows an unestablished cue', () => {
  // The cues carrying findings the evidence did not support. An instruction
  // repeating one would launder a cue into sourced content (§8).
  const forbidden: readonly (readonly [string, string])[] = [
    ['glute-bridge', 'Heels close to your hips'],
    ['glute-bridge', 'Ribs down at the top'],
    ['plank', 'Body in one line'],
    ['bodyweight-squat', 'Feet about shoulder width'],
    ['bodyweight-squat', 'Stand tall at the top'],
  ];
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  for (const [id, cue] of forbidden) {
    const e = result.matrix.exercises.find((x) => String(x.id) === id);
    assert.ok(e !== undefined);
    if (e.instructions.kind !== 'authored') continue;
    for (const s of e.instructions.steps) {
      assert.ok(
        !s.text.includes(cue),
        `${id}: instruction repeats the unestablished cue "${cue}"`,
      );
    }
  }
});

test('execution cues are untouched by the instruction model', () => {
  const result = loadMatrix(AUTHORED_MATRIX);
  assert.ok(result.ok);
  for (const e of result.matrix.exercises) {
    assert.ok(e.cues.length > 0, `${String(e.id)} still carries its cues`);
  }
});
