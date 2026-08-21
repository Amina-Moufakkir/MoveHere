/**
 * The one place content is loaded and checked.
 *
 * Loading is fallible and happens once, at module scope, against data that
 * ships with the app. Generation never loads — it receives a policy that can
 * only be obtained from proven-feasible programming.
 */

import { loadMatrix } from '../src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../src/domain/exercise-catalog.ts';
import { loadGoalPolicies } from '../src/domain/policy-loader.ts';
import { AUTHORED_POLICIES } from '../src/domain/policy-catalog.ts';
import { checkFeasibility, selectPolicy } from '../src/domain/feasibility.ts';
import { generateSession } from '../src/domain/generator.ts';
import { makeSessionMinutes, assessConditions } from '../src/domain/session.ts';
import { projectGenerationView } from '../src/domain/confirmation.ts';
import { seedFrom } from '../src/domain/prng.ts';
import type { ValidatedMatrix } from '../src/domain/matrix-loader.ts';
import type { FeasibleProgramming } from '../src/domain/feasibility.ts';
import type { ConfirmedVenueInventory } from '../src/domain/confirmation.ts';
import type {
  SessionGenerationInput,
  SessionGenerationOutput,
  SessionGoal,
  SessionDuration,
  ConditionsAssessment,
} from '../src/domain/session.ts';
import type { ReportedConditions } from './session-store.ts';
import type { ExerciseId } from '../src/domain/exercise.ts';

const loaded = (() => {
  const m = loadMatrix(AUTHORED_MATRIX);
  const p = loadGoalPolicies(AUTHORED_POLICIES);
  if (!m.ok || !p.ok) return null;
  const f = checkFeasibility(m.matrix, p.policies);
  if (!f.ok) return null;
  return { matrix: m.matrix, programming: f.programming };
})();

export const MATRIX: ValidatedMatrix | null = loaded?.matrix ?? null;
export const PROGRAMMING: FeasibleProgramming | null = loaded?.programming ?? null;

export const exerciseName = (id: ExerciseId): string =>
  MATRIX?.exercises.find((e) => e.id === id)?.name ?? String(id);

export const exerciseCues = (id: ExerciseId): readonly string[] =>
  MATRIX?.exercises.find((e) => e.id === id)?.cues ?? [];

export interface BuildArgs {
  readonly inventory: ConfirmedVenueInventory | null;
  readonly minutes: SessionDuration;
  readonly goal: SessionGoal;
  readonly conditions: ReportedConditions;
  readonly seed: string;
}

/**
 * What the user reported, and nothing more.
 *
 * "Bad out there" records no cause because the UI never asks for one. "Not
 * sure" is unavailable, which withholds the park for a distinguishable reason.
 */
export const assessmentFor = (reported: ReportedConditions): ConditionsAssessment =>
  reported === 'acceptable'
    ? { kind: 'acceptable' }
    : reported === 'adverse'
      ? { kind: 'adverse', cause: { kind: 'user-reported' } }
      : { kind: 'unavailable' };

/**
 * Assembles generation input from confirmed state and the user's choices.
 *
 * The venue view is projected from inventory, so unusable features are dropped
 * before generation ever sees them. A venue with no usable features becomes
 * environment-independent rather than an empty venue-aware context.
 */
export const buildInput = (args: BuildArgs): SessionGenerationInput | null => {
  if (PROGRAMMING === null || MATRIX === null) return null;
  const availableMinutes = makeSessionMinutes(args.minutes);
  if (availableMinutes === null) return null;

  const view = args.inventory === null ? null : projectGenerationView(args.inventory);
  const hasVenue = view !== null && view.usableFeatures.length > 0;

  return {
    context: hasVenue ? { kind: 'venue-aware', venue: view } : { kind: 'environment-independent' },
    policy: selectPolicy(PROGRAMMING, args.goal),
    matrix: MATRIX,
    availableMinutes,
    conditions: assessConditions(assessmentFor(args.conditions)),
    seed: seedFrom(args.seed),
  };
};

export const generateFor = (args: BuildArgs): SessionGenerationOutput | null => {
  const input = buildInput(args);
  return input === null ? null : generateSession(input);
};
