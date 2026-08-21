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

export const EXERCISES: readonly Exercise[] = [
  // --- squat ---------------------------------------------------------------
  {
    id: ex('bodyweight-squat'),
    name: 'Bodyweight squat',
    pattern: 'squat',
    laterality: 'bilateral',
    prescriptionKinds: ['reps', 'time'],
    cues: ['Feet about shoulder width', 'Sit back and down', 'Stand tall at the top'],
  },
  {
    id: ex('reverse-lunge'),
    name: 'Reverse lunge',
    pattern: 'squat',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    cues: ['Step back, not down', 'Keep the front shin upright', 'Push through the front foot'],
  },
  {
    id: ex('split-squat'),
    name: 'Split squat',
    pattern: 'squat',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    cues: ['Stagger your stance', 'Lower straight down', 'Keep your weight on the front leg'],
  },
  {
    id: ex('step-up'),
    name: 'Step-up',
    pattern: 'squat',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    cues: ['Place the whole foot on the step', 'Drive through the top leg', 'Step down under control'],
  },

  // --- hinge ---------------------------------------------------------------
  {
    id: ex('glute-bridge'),
    name: 'Glute bridge',
    pattern: 'hinge',
    laterality: 'bilateral',
    prescriptionKinds: ['reps', 'time'],
    cues: ['Heels close to your hips', 'Push the floor away', 'Ribs down at the top'],
  },
  {
    id: ex('hip-hinge'),
    name: 'Standing hip hinge',
    pattern: 'hinge',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    cues: ['Soft knees', 'Push your hips back', 'Flat back throughout'],
  },
  {
    id: ex('single-leg-deadlift'),
    name: 'Single-leg deadlift',
    pattern: 'hinge',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    cues: ['Hinge at the hip', 'Back leg and torso move together', 'Move slowly for balance'],
  },

  // --- push ----------------------------------------------------------------
  {
    id: ex('push-up'),
    name: 'Push-up',
    pattern: 'push',
    laterality: 'bilateral',
    prescriptionKinds: ['reps', 'time'],
    cues: ['Hands under your shoulders', 'Body in one line', 'Elbows back, not flared'],
  },
  {
    id: ex('incline-push-up'),
    name: 'Incline push-up',
    pattern: 'push',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    cues: ['Hands on the surface, feet back', 'Body in one line', 'Lower your chest to your hands'],
  },
  {
    id: ex('pike-push-up'),
    name: 'Pike push-up',
    pattern: 'push',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    cues: ['Hips high', 'Lower the top of your head toward the ground', 'Press back up'],
  },

  // --- pull ----------------------------------------------------------------
  {
    id: ex('dead-hang'),
    name: 'Dead hang',
    pattern: 'pull',
    laterality: 'bilateral',
    prescriptionKinds: ['time'],
    cues: ['Full grip on the bar', 'Shoulders active, not shrugged', 'Breathe steadily'],
  },
  {
    id: ex('pull-up'),
    name: 'Pull-up',
    pattern: 'pull',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    cues: ['Start from a full hang', 'Pull your chest toward the bar', 'Lower under control'],
  },

  // --- core ----------------------------------------------------------------
  {
    id: ex('plank'),
    name: 'Plank',
    pattern: 'core',
    laterality: 'bilateral',
    prescriptionKinds: ['time'],
    cues: ['Forearms under your shoulders', 'Body in one line', 'Breathe, do not hold your breath'],
  },
  {
    id: ex('side-plank'),
    name: 'Side plank',
    pattern: 'core',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    cues: ['Elbow under your shoulder', 'Hips stacked and lifted', 'Keep your neck long'],
  },
  {
    id: ex('dead-bug'),
    name: 'Dead bug',
    pattern: 'core',
    laterality: 'unilateral',
    prescriptionKinds: ['reps'],
    cues: ['Lower back stays down', 'Extend opposite arm and leg', 'Move slowly'],
  },
  {
    id: ex('hanging-knee-raise'),
    name: 'Hanging knee raise',
    pattern: 'core',
    laterality: 'bilateral',
    prescriptionKinds: ['reps'],
    cues: ['Hang with active shoulders', 'Raise your knees toward your chest', 'Lower without swinging'],
  },

  // --- locomotion ----------------------------------------------------------
  {
    id: ex('march-in-place'),
    name: 'March in place',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    cues: ['Lift your knees to hip height', 'Stay tall', 'Land softly'],
  },
  {
    id: ex('brisk-walk'),
    name: 'Brisk walk',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time', 'distance'],
    cues: ['Steady, purposeful pace', 'Relaxed shoulders', 'Breathe through your nose if you can'],
  },
  {
    id: ex('easy-run'),
    name: 'Easy run',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time', 'distance'],
    cues: ['Conversational pace', 'Short, quick steps', 'Stay relaxed'],
  },
  {
    id: ex('shuttle-run'),
    name: 'Shuttle run',
    pattern: 'locomotion',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    cues: ['Run out, touch down, run back', 'Decelerate before you turn', 'Keep your turns tidy'],
  },

  // --- mobility ------------------------------------------------------------
  {
    id: ex('hip-flexor-stretch'),
    name: 'Half-kneeling hip flexor stretch',
    pattern: 'mobility',
    laterality: 'unilateral',
    prescriptionKinds: ['time'],
    cues: ['Half-kneeling position', 'Tuck your hips under', 'Breathe and hold'],
  },
  {
    id: ex('thoracic-rotation'),
    name: 'Thoracic rotation',
    pattern: 'mobility',
    laterality: 'unilateral',
    prescriptionKinds: ['reps', 'time'],
    cues: ['Open one arm toward the sky', 'Follow your hand with your eyes', 'Move slowly'],
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
  compat('parallel-bars', 'hanging-knee-raise', 'From a support hold'),

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
