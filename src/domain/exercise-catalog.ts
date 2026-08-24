/**
 * Exercise catalog and compatibility matrix — PROJECT CONTENT (§8).
 *
 * Authored from researched general-fitness conventions for the school and
 * portfolio MVP. This is NOT professional review. It does not satisfy Gate E,
 * and sessions built from it carry a visible provenance label.
 *
 * It authorizes nothing medical, rehabilitative, diagnostic, or
 * injury-specific (§10).
 *
 * Deliberately small and inspectable: every entry is here, in one file, and the
 * whole matrix can be read in a few minutes. Growth should be resisted until a
 * concrete gap justifies it.
 */

import type {
  AuthoredMatrix,
  Exercise,
  ExerciseId,
  ExerciseCompatibility,
  CompatibilityEntryId,
  EnvironmentIndependentMovement,
  EnvironmentIndependentDeclarationId,
  ContentAuthority,
  MatrixVersion,
  MovementStep,
  PresentableAuthority,
} from './exercise.ts';

const PROJECT: ContentAuthority = {
  status: 'project-content',
  authoredAt: '2026-08-20',
  basisRefs: [
    'Common general-fitness bodyweight training conventions',
    'Movement-pattern coverage model (squat / hinge / push / pull / core / locomotion)',
  ],
};

const ex = (id: string): ExerciseId => id as ExerciseId;

/**
 * Movement instructions — authoring discipline (§8).
 *
 * Every step below is written from a construction fact a person read in a
 * primary source and recorded in `docs/movement-instruction-evidence.md`.
 * Nothing here comes from model knowledge, from an execution cue, or from
 * material that document lists as discarded.
 *
 * What that rules out is worth naming, because each was available and each was
 * declined: depth and range targets, joint-alignment prescriptions, bracing and
 * breathing instructions, fault corrections, tempo, hold durations, and every
 * benefit or muscle claim. An instruction says how to get into a movement and
 * what it is. It does not say how far, how fast, how many, or why.
 *
 * **Cues are not a source.** Where a cue says something the evidence does not,
 * the instruction stays silent rather than borrowing it — a glute bridge
 * instruction does not say heels close to the hips, because no source read for
 * this project establishes a heel-to-hip distance.
 *
 * Instructions carry their own authority, separate from the exercise's, and
 * name the page they rest on.
 */
const instructionBasis = (source: string, authoredAt = '2026-08-23'): PresentableAuthority => ({
  status: 'project-content',
  authoredAt,
  basisRefs: [source, 'docs/movement-instruction-evidence.md — verification register'],
});

const step = (kind: MovementStep['kind'], text: string): MovementStep => ({ kind, text });

/**
 * `countingModes` — how a prescribed number may be read for each movement.
 *
 * Authored per movement rather than inferred, because the obvious inference is
 * wrong. `laterality` means two different things in this catalog: trained one
 * side at a time (split squat, side plank) and limbs alternate as part of the
 * gait (walk, run, march, shuttle). Both are `unilateral`; only the first
 * accepts `per-side`. Deriving counting from laterality prescribes "walk two
 * minutes per side".
 *
 * Three movements accept both, and the reason is the same each time: doing all
 * the reps on one side and then the other, or alternating sides throughout,
 * are both real ways to perform them. `step-up` and `reverse-lunge` alternate
 * or not; `dead-bug` alternates diagonals within a set or works one at a time.
 * `thoracic-rotation` likewise. Nothing else in the catalog is genuinely
 * ambiguous, and a mode is not added to widen a slot.
 */
/**
 * Every movement is `outstanding`. None is `not-required`.
 *
 * `not-required` is a content decision — a claim that a movement genuinely
 * needs no written instruction — and the canonical plan establishes it for
 * nothing. Marking walking or running `not-required` here because it seems
 * obvious would be exactly the silent classification the three-state model
 * exists to prevent: it would record a decision nobody made, and it would be
 * indistinguishable afterwards from one that was.
 *
 * Pass 1 adds the contract. The content, and the per-movement judgment of which
 * state each belongs in, is a separate authoring pass.
 */
export const EXERCISES: readonly Exercise[] = [
  // --- squat ---------------------------------------------------------------
  {
    id: ex('bodyweight-squat'),
    name: 'Bodyweight squat',
    pattern: 'squat',
    laterality: 'bilateral',
    prescriptionKinds: ['reps', 'time'],
    countingModes: ['total'],
    cues: ['Feet about shoulder width', 'Sit back and down', 'Stand tall at the top'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand with your feet a little wider than your hips, toes turned out slightly.'),
        step('action', 'Move your hips back, then down, letting your hips and knees bend. Your heels stay on the floor.'),
        step('return', 'Press back up, hips and torso rising together, until you are standing again.'),
      ],
      authority: instructionBasis('ACE Exercise Library 135, Bodyweight Squat — read 2026-08-23'),
    },
  },
  {
    id: ex('reverse-lunge'),
    name: 'Reverse lunge',
    pattern: 'squat',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total', 'per-side'],
    cues: ['Step back, not down', 'Keep the front shin upright', 'Push through the front foot'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand with your feet about hip-width apart.'),
        step('action', 'Step one foot backward until it touches the ground behind you.'),
        step('action', 'Lower your back knee toward the floor, keeping your chest raised.'),
        step('return', 'Press your front foot into the ground and bring your back leg forward to stand again.'),
      ],
      authority: instructionBasis(
        'ACE Exercise Library 319, Reverse Lunge (barbell-loaded source, used only for facts that survive removing the load) — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },
  {
    id: ex('split-squat'),
    name: 'Split squat',
    pattern: 'squat',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['per-side'],
    cues: ['Stagger your stance', 'Lower straight down', 'Keep your weight on the front leg'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand with one foot forward and the other behind you, about hip-width apart.'),
        step('setup', 'Set your feet further apart front to back than a walking step, with your back heel lifted off the floor.'),
        step('setup', 'Stand tall, with your toes and knees pointing forward.'),
        step('action', 'Lower your back knee toward the floor.'),
        step('return', 'Press your front foot into the ground to come back up.'),
      ],
      overrides: [
        {
          featureId: 'park-bench',
          replaces: 'setup',
          steps: [
            step('setup', 'Stand with one foot forward and the other behind you, facing away from the bench.'),
            step('setup', 'Rest your back foot on the bench behind you.'),
          ],
          authority: instructionBasis(
            'ACE Exercise Library 366, Bulgarian Split Squat — read 2026-08-23',
            '2026-08-24',
          ),
        },
      ],
      authority: instructionBasis(
        'NSCA, The Undervalued Lunge (PTQ 4.4) — Completely Stationary modification — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },
  {
    id: ex('step-up'),
    name: 'Step-up',
    pattern: 'squat',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total', 'per-side'],
    cues: ['Place the whole foot on the step', 'Drive through the top leg', 'Step down under control'],
    instructions: { kind: 'outstanding' },
  },

  // --- hinge ---------------------------------------------------------------
  {
    id: ex('glute-bridge'),
    name: 'Glute bridge',
    pattern: 'hinge',
    laterality: 'bilateral',
    prescriptionKinds: ['reps', 'time'],
    countingModes: ['total'],
    cues: ['Heels close to your hips', 'Push the floor away', 'Ribs down at the top'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Lie on your back with your knees bent and your feet flat on the floor.'),
        step('setup', 'Set your feet about hip-width apart, toes pointing away from you.'),
        step('action', 'Press your heels into the floor and raise your hips.'),
        step('return', 'Lower your hips back toward the floor.'),
      ],
      authority: instructionBasis('ACE Exercise Library 49, Glute Bridge — read 2026-08-23'),
    },
  },
  {
    id: ex('hip-hinge'),
    name: 'Standing hip hinge',
    pattern: 'hinge',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total'],
    cues: ['Soft knees', 'Push your hips back', 'Flat back throughout'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('single-leg-deadlift'),
    name: 'Single-leg deadlift',
    pattern: 'hinge',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['per-side'],
    cues: ['Hinge at the hip', 'Back leg and torso move together', 'Move slowly for balance'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Stand with your feet about hip-width apart and your knees slightly bent.'),
        step('action', 'Move your hips backward and let one foot lift away from the floor.'),
        step('action', 'Let that leg reach out behind you as your torso leans forward.'),
        step('return', 'Come back upright, bringing your free leg back down toward the floor.'),
      ],
      authority: instructionBasis(
        'ACE Exercise Library 329, Single-leg Romanian Deadlift — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },

  // --- push ----------------------------------------------------------------
  {
    id: ex('push-up'),
    name: 'Push-up',
    pattern: 'push',
    laterality: 'bilateral',
    prescriptionKinds: ['reps', 'time'],
    countingModes: ['total'],
    cues: ['Hands under your shoulders', 'Body in one line', 'Elbows back, not flared'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Place your hands on the floor about shoulder-width apart.'),
        step('setup', 'Set your shoulders directly over your hands and extend your body, with no bend at your hips or knees.'),
        step('action', 'Lower your body toward the floor, keeping your torso rigid.'),
        step('return', 'Press back up until your arms are straight again.'),
      ],
      authority: instructionBasis(
        'ACE Exercise Library 41, Push-Up — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },
  {
    id: ex('incline-push-up'),
    name: 'Incline push-up',
    pattern: 'push',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total'],
    cues: ['Hands on the surface, feet back', 'Body in one line', 'Lower your chest to your hands'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('pike-push-up'),
    name: 'Pike push-up',
    pattern: 'push',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total'],
    cues: ['Hips high', 'Lower the top of your head toward the ground', 'Press back up'],
    instructions: { kind: 'outstanding' },
  },

  // --- pull ----------------------------------------------------------------
  {
    id: ex('dead-hang'),
    name: 'Dead hang',
    pattern: 'pull',
    laterality: 'bilateral',
    prescriptionKinds: ['time'],
    countingModes: ['total'],
    cues: ['Full grip on the bar', 'Shoulders active, not shrugged', 'Breathe steadily'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('pull-up'),
    name: 'Pull-up',
    pattern: 'pull',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total'],
    cues: ['Start from a full hang', 'Pull your chest toward the bar', 'Lower under control'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'confirmed-feature', featureId: 'pull-up-bar' },
      steps: [
        step('setup', 'Take a full grip on the bar with your arms reaching overhead.'),
        step('setup', 'Let your body hang with your arms straight and your feet off the ground.'),
        step('action', 'Bend your elbows and drive them downward to pull your body up, keeping your trunk upright.'),
        step('return', 'Lower back down until your arms are straight overhead again.'),
      ],
      authority: instructionBasis(
        'ACE Exercise Library 191, Pull-ups — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },

  // --- core ----------------------------------------------------------------
  {
    id: ex('plank'),
    name: 'Plank',
    pattern: 'core',
    laterality: 'bilateral',
    prescriptionKinds: ['time'],
    countingModes: ['total'],
    cues: ['Forearms under your shoulders', 'Body in one line', 'Breathe, do not hold your breath'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Lie face down with your legs straight out behind you.'),
        step('setup', 'Place your elbows on the floor directly under your shoulders.'),
        step('action', 'Lift your body off the floor and hold it there, torso and legs stiff, shoulders over your elbows.'),
      ],
      authority: instructionBasis('ACE Exercise Library 32, Front Plank — read 2026-08-23'),
    },
  },
  {
    id: ex('side-plank'),
    name: 'Side plank',
    pattern: 'core',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    countingModes: ['per-side'],
    cues: ['Elbow under your shoulder', 'Hips stacked and lifted', 'Keep your neck long'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Lie on one side with your legs straight, one leg resting on top of the other.'),
        step('setup', 'Place your lower elbow on the floor directly under your shoulder.'),
        step('action', 'Lift your hips and knees away from the floor and hold, keeping that elbow under your shoulder.'),
      ],
      authority: instructionBasis(
        'ACE Exercise Library 101, Side Plank with Straight Leg — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },
  {
    id: ex('dead-bug'),
    name: 'Dead bug',
    pattern: 'core',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total', 'per-side'],
    cues: ['Lower back stays down', 'Extend opposite arm and leg', 'Move slowly'],
    instructions: {
      kind: 'authored',
      defaultContext: { kind: 'environment-independent' },
      steps: [
        step('setup', 'Lie on your back and raise both arms so your elbows are over your shoulders.'),
        step('setup', 'Raise both legs so your knees are directly over your hips and bent about ninety degrees.'),
        step('action', 'Lower one arm and the opposite leg toward the floor together.'),
        step('return', 'Bring that arm and that leg back to where they started.'),
      ],
      authority: instructionBasis(
        'ACE Exercise Library 147, Supine Dead Bug — read 2026-08-23',
        '2026-08-24',
      ),
    },
  },
  {
    id: ex('hanging-knee-raise'),
    name: 'Hanging knee raise',
    pattern: 'core',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total'],
    cues: ['Hang with active shoulders', 'Raise your knees toward your chest', 'Lower without swinging'],
    instructions: { kind: 'outstanding' },
  },
  /**
   * A separate movement from the hanging version, not a variation of it (§8).
   *
   * Hanging, the body is below the hands with the trunk unsupported. On
   * parallel bars it is held above them with the elbows extended and the torso
   * upright — a different position of nearly every joint above the hips, and a
   * stability demand that is not comparable. One entry could not carry both:
   * "Hang with active shoulders" is false here.
   *
   * The structural metadata below is new project content, not inherited. It
   * matches the hanging version on pattern, laterality, dose and counting
   * because those are the same facts about the same trunk action, and it shares
   * no cue text with it.
   */
  {
    id: ex('supported-knee-raise'),
    name: 'Supported knee raise',
    pattern: 'core',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    countingModes: ['total'],
    cues: ['Support yourself with straight arms', 'Keep your torso upright', 'Raise and lower your knees under control'],
    instructions: { kind: 'outstanding' },
  },

  // --- locomotion ----------------------------------------------------------
  {
    id: ex('march-in-place'),
    name: 'March in place',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    countingModes: ['total'],
    cues: ['Lift your knees to hip height', 'Stay tall', 'Land softly'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('brisk-walk'),
    name: 'Brisk walk',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time', 'distance'],
    countingModes: ['total'],
    cues: ['Steady, purposeful pace', 'Relaxed shoulders', 'Breathe through your nose if you can'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('easy-run'),
    name: 'Easy run',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time', 'distance'],
    countingModes: ['total'],
    cues: ['Conversational pace', 'Short, quick steps', 'Stay relaxed'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('shuttle-run'),
    name: 'Shuttle run',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    countingModes: ['total'],
    cues: ['Run out, touch down, run back', 'Decelerate before you turn', 'Keep your turns tidy'],
    instructions: { kind: 'outstanding' },
  },

  // --- mobility ------------------------------------------------------------
  {
    id: ex('hip-flexor-stretch'),
    name: 'Half-kneeling hip flexor stretch',
    pattern: 'mobility',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    countingModes: ['per-side'],
    cues: ['Half-kneeling position', 'Tuck your hips under', 'Breathe and hold'],
    instructions: { kind: 'outstanding' },
  },
  {
    id: ex('thoracic-rotation'),
    name: 'Thoracic rotation',
    pattern: 'mobility',
    laterality: 'unilateral',
    prescriptionKinds: ['reps', 'time'],
    countingModes: ['total', 'per-side'],
    cues: ['Open one arm toward the sky', 'Follow your hand with your eyes', 'Move slowly'],
    instructions: { kind: 'outstanding' },
  },
];

const eiId = (id: string): EnvironmentIndependentDeclarationId =>
  id as EnvironmentIndependentDeclarationId;

const ei = (exerciseId: string): EnvironmentIndependentMovement => ({
  id: eiId(`ei-${exerciseId}`),
  exerciseId: ex(exerciseId),
  environmentIndependent: true,
  assumes: 'nothing-beyond-standing-space',
  authority: PROJECT,
});

/**
 * Movements needing no venue feature.
 *
 * Squat, hinge, push, and core each carry at least two, so a substitute session
 * is always constructible.
 *
 * Pull carries none. True pulling requires something to pull on, and no
 * scapular substitute is offered in its place: a session without a bar simply
 * does not train pulling. Policy may make pull optional in substitute sessions;
 * it may not have the catalog pretend the gap is filled.
 */
export const ENVIRONMENT_INDEPENDENT: readonly EnvironmentIndependentMovement[] = [
  ei('bodyweight-squat'),
  ei('reverse-lunge'),
  ei('split-squat'),
  ei('glute-bridge'),
  ei('hip-hinge'),
  ei('single-leg-deadlift'),
  ei('push-up'),
  ei('pike-push-up'),
  ei('plank'),
  ei('side-plank'),
  ei('dead-bug'),
  ei('march-in-place'),
  ei('hip-flexor-stretch'),
  ei('thoracic-rotation'),
];

const cid = (id: string): CompatibilityEntryId => id as CompatibilityEntryId;

const compat = (
  featureId: ExerciseCompatibility['featureId'],
  exerciseId: string,
  variationLabel?: string,
): ExerciseCompatibility => ({
  id: cid(`${featureId}--${exerciseId}`),
  exerciseId: ex(exerciseId),
  featureId,
  ...(variationLabel === undefined ? {} : { variationLabel }),
  authority: PROJECT,
});

/**
 * Feature-to-movement compatibility.
 *
 * Claims are about compatibility, not safety, and none depends on the condition
 * of a specific structure (§9).
 */
export const COMPATIBILITIES: readonly ExerciseCompatibility[] = [
  // Bench — step height and an elevated surface for the hands.
  compat('park-bench', 'step-up', 'Bench step-up'),
  compat('park-bench', 'incline-push-up', 'Hands on the bench'),
  compat('park-bench', 'split-squat', 'Rear foot elevated'),

  // Stairs — the same two ideas at a different height.
  compat('stairs', 'step-up', 'Stair step-up'),
  compat('stairs', 'incline-push-up', 'Hands on a step'),

  // Purpose-built bars.
  compat('pull-up-bar', 'dead-hang'),
  compat('pull-up-bar', 'pull-up'),
  compat('pull-up-bar', 'hanging-knee-raise'),
  compat('parallel-bars', 'supported-knee-raise'),

  // Terrain and surfaces.
  compat('hill', 'brisk-walk', 'Uphill'),
  compat('hill', 'easy-run', 'Uphill'),
  compat('walking-running-path', 'brisk-walk'),
  compat('walking-running-path', 'easy-run'),
  compat('running-track', 'easy-run'),
  compat('running-track', 'shuttle-run'),
  compat('hard-court', 'shuttle-run'),
  compat('hard-court', 'brisk-walk'),
];

export const AUTHORED_MATRIX: AuthoredMatrix = {
  version: '1' as MatrixVersion,
  exercises: EXERCISES,
  compatibilities: COMPATIBILITIES,
  environmentIndependent: ENVIRONMENT_INDEPENDENT,
};
