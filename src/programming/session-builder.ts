/**
 * The one place content is loaded and checked.
 *
 * Shared by both clients (§15). Loading, feasibility checking, and assembling
 * generation input are the same decisions on every platform, and duplicating
 * them per client would mean a second place for the matrix and policy to be
 * accepted — or silently rejected — on different terms.
 *
 * Loading is fallible and happens once, at module scope, against data that
 * ships with the app. Generation never loads — it receives a policy that can
 * only be obtained from proven-feasible programming.
 */

import { loadMatrix } from '../domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '../domain/exercise-catalog.ts';
import { loadGoalPolicies } from '../domain/policy-loader.ts';
import { AUTHORED_POLICIES } from '../domain/policy-catalog.ts';
import { checkFeasibility, selectPolicy } from '../domain/feasibility.ts';
import { generateSession } from '../domain/generator.ts';
import { makeSessionMinutes, assessConditions } from '../domain/session.ts';
import { projectGenerationView } from '../domain/confirmation.ts';
import { seedFrom } from '../domain/prng.ts';
import type { ValidatedMatrix } from '../domain/matrix-loader.ts';
import type { FeasibleProgramming } from '../domain/feasibility.ts';
import type { ConfirmedVenueInventory } from '../domain/confirmation.ts';
import type {
  SessionGenerationInput,
  SessionGenerationOutput,
  SessionGoal,
  SessionDuration,
} from '../domain/session.ts';
import { assessmentFor } from './conditions.ts';
import type { ReportedConditions } from './conditions.ts';
import type { ExerciseId } from '../domain/exercise.ts';

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
