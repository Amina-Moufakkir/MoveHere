/**
 * Strength and conditioning programming policy — PROJECT CONTENT (§8).
 *
 * Authored from researched general-fitness conventions for the school and
 * portfolio MVP. NOT professional review. Does not satisfy Gate E. Sessions
 * built from it carry a visible provenance label. Authorizes nothing medical,
 * rehabilitative, diagnostic, or injury-specific (§10).
 *
 * Two rules shape every program here:
 *
 * 1. A required slot must be satisfiable from the environment-independent pool
 *    alone, because a venue's contents are unknown when policy is loaded.
 * 2. Pull is therefore never required. True pulling needs something to pull on,
 *    and nothing in this file pretends otherwise.
 *
 * Mobility is deferred as a goal (§6 step 4). The mobility *pattern* appears
 * here only as closing work inside strength and conditioning.
 *
 * Several slots are optional in the venue-aware context but required in the
 * substitute context. At a venue they yield to venue-dependent work; with
 * nothing confirmed they are what keeps a substitute session worth doing. Every
 * such slot is satisfiable from the environment-independent pool — pull never
 * is, and is therefore optional everywhere.
 */

import type {
  AuthoredGoalPolicy,
  PrescriptionVariant,
  BlockTemplate,
  DurationProgram,
  SlotTemplate,
  SlotId,
  GoalPolicyId,
  PolicyVersion,
  SlotObligation,
} from './policy.ts';
import type { MovementPattern, Prescription, ContentAuthority } from './exercise.ts';

const PROJECT: ContentAuthority = {
  status: 'project-content',
  authoredAt: '2026-08-20',
  basisRefs: [
    'Common general-fitness bodyweight programming conventions',
    'Movement-pattern coverage model (squat / hinge / push / pull / core / locomotion)',
  ],
};

const reps = (sets: number, count: number): Prescription => ({
  kind: 'reps',
  sets,
  reps: count,
  counting: 'total',
});

const perSide = (sets: number, count: number): Prescription => ({
  kind: 'reps',
  sets,
  reps: count,
  counting: 'per-side',
});

/**
 * A held effort.
 *
 * `counting` is not decoration. A per-side hold is twice the work of a total
 * hold at the same duration, so a slot that changes it must change
 * `estimatedSeconds` with it — counting, dose and time are one decision (§8).
 *
 * Two core holds are per-side — `s30-core` and `c45-core-2` — and both are
 * there so a side plank has somewhere to be prescribed unambiguously. Before
 * counting compatibility existed, every core hold was nominally `total` and
 * side planks filled them anyway, which is how "3 × 30s" came to mean either
 * 30 seconds or 60 depending on which movement landed in the slot.
 */
const hold = (sets: number, seconds: number, counting: 'total' | 'per-side' = 'total'): Prescription => ({
  kind: 'time',
  sets,
  seconds,
  counting,
});

/**
 * One authored dosing.
 *
 * `estimatedSeconds` sits beside the prescription it belongs to: a per-side
 * dose is more work than a total dose of the same shape, and the two are one
 * decision rather than two numbers that happen to be near each other.
 */
const v = (prescription: Prescription, estimatedSeconds: number): PrescriptionVariant => ({
  prescription,
  estimatedSeconds,
});

interface SlotSpec {
  readonly id: string;
  readonly patterns: readonly [MovementPattern, ...MovementPattern[]];
  /**
   * Ordered. **The first variant is the slot's primary dosing** — the one it
   * was authored around — and any later variant exists for movements that
   * dosing cannot honestly describe. A movement takes the first variant it
   * accepts, so precedence preserves each slot's original character: a total
   * slot still gives a bodyweight squat a total count, and only a split squat
   * falls through to the per-side variant.
   *
   * Reordering these is a programming change, not a reformatting.
   */
  readonly variants: readonly [PrescriptionVariant, ...PrescriptionVariant[]];
  readonly venueAware: SlotObligation;
  readonly substitute: SlotObligation;
}

const slot = (spec: SlotSpec): SlotTemplate => ({
  id: spec.id as SlotId,
  eligiblePatterns: spec.patterns,
  variants: spec.variants,
  obligation: { 'venue-aware': spec.venueAware, substitute: spec.substitute },
  sourcePreference: 'prefer-venue-feature',
  allowRepeatExercise: false,
});

const block = (name: string, slots: readonly [SlotTemplate, ...SlotTemplate[]]): BlockTemplate => ({
  name,
  slots,
});

const program = (
  blocks: readonly [BlockTemplate, ...BlockTemplate[]],
  restBetweenItemsSeconds: number,
  restBetweenBlocksSeconds: number,
): DurationProgram => ({ blocks, restBetweenItemsSeconds, restBetweenBlocksSeconds });

/* ---------------------------------------------------------------- strength */

const STRENGTH_REST_ITEM = 60;
const STRENGTH_REST_BLOCK = 60;

const strength10 = program(
  [
    block('Main', [
      slot({ id: 's10-squat', patterns: ['squat'], variants: [v(reps(3, 8), 80), v(perSide(2, 8), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's10-push', patterns: ['push'], variants: [v(reps(3, 8), 80)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's10-hinge', patterns: ['hinge'], variants: [v(reps(3, 10), 80), v(perSide(2, 8), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's10-pull', patterns: ['pull'], variants: [v(reps(3, 5), 80)], venueAware: 'optional', substitute: 'optional' }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

const strength20 = program(
  [
    block('Strength', [
      slot({ id: 's20-squat', patterns: ['squat'], variants: [v(reps(3, 10), 120), v(perSide(2, 8), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's20-push', patterns: ['push'], variants: [v(reps(3, 10), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's20-hinge', patterns: ['hinge'], variants: [v(reps(3, 10), 120), v(perSide(2, 8), 120)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Accessory', [
      slot({ id: 's20-pull-hold', patterns: ['pull'], variants: [v(hold(3, 20), 120)], venueAware: 'optional', substitute: 'optional' }),
      slot({ id: 's20-squat-2', patterns: ['squat'], variants: [v(perSide(2, 8), 120), v(reps(3, 10), 120)], venueAware: 'optional', substitute: 'required' }),
      slot({ id: 's20-core', patterns: ['core'], variants: [v(hold(3, 30), 90), v(hold(2, 30, 'per-side'), 120)], venueAware: 'required', substitute: 'required' }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

const strength30 = program(
  [
    block('Strength', [
      slot({ id: 's30-squat', patterns: ['squat'], variants: [v(reps(4, 10), 150), v(perSide(3, 8), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's30-push', patterns: ['push'], variants: [v(reps(4, 10), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's30-hinge', patterns: ['hinge'], variants: [v(reps(4, 10), 150), v(perSide(3, 8), 150)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Accessory', [
      slot({ id: 's30-pull', patterns: ['pull'], variants: [v(reps(3, 5), 150)], venueAware: 'optional', substitute: 'optional' }),
      slot({ id: 's30-squat-2', patterns: ['squat'], variants: [v(perSide(3, 8), 150), v(reps(4, 10), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's30-core', patterns: ['core'], variants: [v(hold(3, 30, 'per-side'), 210), v(hold(3, 30), 120)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Finish', [
      slot({ id: 's30-core-2', patterns: ['core'], variants: [v(reps(2, 10), 120)], venueAware: 'optional', substitute: 'required' }),
      slot({ id: 's30-mobility', patterns: ['mobility'], variants: [v(hold(1, 45, 'per-side'), 90)], venueAware: 'optional', substitute: 'required' }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

const strength45 = program(
  [
    block('Strength', [
      slot({ id: 's45-squat', patterns: ['squat'], variants: [v(reps(4, 12), 180), v(perSide(3, 10), 180)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's45-hinge', patterns: ['hinge'], variants: [v(reps(4, 12), 180), v(perSide(3, 8), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's45-push', patterns: ['push'], variants: [v(reps(4, 12), 180)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Accessory', [
      slot({ id: 's45-pull', patterns: ['pull'], variants: [v(reps(3, 5), 180)], venueAware: 'optional', substitute: 'optional' }),
      slot({ id: 's45-squat-2', patterns: ['squat'], variants: [v(perSide(3, 10), 180), v(reps(4, 12), 180)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's45-push-2', patterns: ['push'], variants: [v(reps(3, 10), 150)], venueAware: 'optional', substitute: 'required' }),
    ]),
    block('Trunk', [
      slot({ id: 's45-hinge-2', patterns: ['hinge'], variants: [v(perSide(3, 8), 150), v(reps(4, 12), 180)], venueAware: 'optional', substitute: 'required' }),
      slot({ id: 's45-core', patterns: ['core'], variants: [v(hold(3, 40), 150), v(hold(2, 40, 'per-side'), 190)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 's45-core-2', patterns: ['core'], variants: [v(reps(3, 10), 120)], venueAware: 'optional', substitute: 'required' }),
    ]),
    block('Finish', [
      slot({ id: 's45-mobility', patterns: ['mobility'], variants: [v(hold(1, 45, 'per-side'), 120)], venueAware: 'optional', substitute: 'required' }),
      slot({ id: 's45-mobility-2', patterns: ['mobility'], variants: [v(hold(1, 45, 'per-side'), 120)], venueAware: 'optional', substitute: 'required' }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

/* ------------------------------------------------------------ conditioning */

const COND_REST_ITEM = 30;
const COND_REST_BLOCK = 45;

const conditioning10 = program(
  [
    block('Circuit', [
      slot({ id: 'c10-loco', patterns: ['locomotion'], variants: [v(hold(1, 120), 130)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c10-squat', patterns: ['squat'], variants: [v(reps(3, 12), 90), v(perSide(2, 8), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c10-push', patterns: ['push'], variants: [v(reps(3, 10), 90)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c10-core', patterns: ['core'], variants: [v(hold(3, 30), 90), v(hold(2, 30, 'per-side'), 120)], venueAware: 'required', substitute: 'required' }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

const conditioning20 = program(
  [
    block('Build', [
      slot({ id: 'c20-loco', patterns: ['locomotion'], variants: [v(hold(1, 180), 190)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Circuit', [
      slot({ id: 'c20-squat', patterns: ['squat'], variants: [v(reps(3, 15), 120), v(perSide(2, 8), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c20-push', patterns: ['push'], variants: [v(reps(3, 12), 120)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c20-core', patterns: ['core'], variants: [v(hold(3, 30), 120), v(hold(2, 30, 'per-side'), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c20-hinge', patterns: ['hinge'], variants: [v(reps(3, 12), 120), v(perSide(2, 8), 120)], venueAware: 'optional', substitute: 'required' }),
    ]),
    block('Finish', [
      slot({ id: 'c20-loco-2', patterns: ['locomotion'], variants: [v(hold(1, 150), 160)], venueAware: 'optional', substitute: 'optional' }),
      slot({ id: 'c20-core-2', patterns: ['core'], variants: [v(reps(2, 10), 90)], venueAware: 'optional', substitute: 'optional' }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

const conditioning30 = program(
  [
    block('Build', [
      slot({ id: 'c30-loco', patterns: ['locomotion'], variants: [v(hold(1, 240), 250)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Circuit', [
      slot({ id: 'c30-squat', patterns: ['squat'], variants: [v(reps(4, 15), 150), v(perSide(3, 10), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c30-push', patterns: ['push'], variants: [v(reps(4, 12), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c30-core', patterns: ['core'], variants: [v(hold(4, 30), 150), v(hold(3, 30, 'per-side'), 180)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c30-hinge', patterns: ['hinge'], variants: [v(reps(3, 12), 150), v(perSide(2, 8), 120)], venueAware: 'optional', substitute: 'required' }),
    ]),
    block('Finish', [
      slot({ id: 'c30-loco-2', patterns: ['locomotion'], variants: [v(hold(1, 180), 190)], venueAware: 'optional', substitute: 'optional' }),
      slot({ id: 'c30-squat-2', patterns: ['squat'], variants: [v(perSide(3, 10), 150), v(reps(4, 15), 150)], venueAware: 'optional', substitute: 'required' }),
      slot({ id: 'c30-core-2', patterns: ['core'], variants: [v(reps(3, 10), 120)], venueAware: 'optional', substitute: 'required' }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

const conditioning45 = program(
  [
    block('Build', [
      slot({ id: 'c45-loco', patterns: ['locomotion'], variants: [v(hold(1, 300), 310)], venueAware: 'required', substitute: 'required' }),
    ]),
    block('Circuit', [
      slot({ id: 'c45-squat', patterns: ['squat'], variants: [v(reps(4, 15), 180), v(perSide(3, 12), 180)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c45-push', patterns: ['push'], variants: [v(reps(4, 12), 180)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c45-core', patterns: ['core'], variants: [v(hold(4, 40), 180), v(hold(3, 40, 'per-side'), 240)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c45-hinge', patterns: ['hinge'], variants: [v(reps(4, 12), 180), v(perSide(3, 8), 150)], venueAware: 'optional', substitute: 'required' }),
    ]),
    block('Intervals', [
      slot({ id: 'c45-loco-2', patterns: ['locomotion'], variants: [v(hold(1, 240), 250)], venueAware: 'optional', substitute: 'optional' }),
      slot({ id: 'c45-squat-2', patterns: ['squat'], variants: [v(perSide(3, 12), 180), v(reps(4, 15), 180)], venueAware: 'optional', substitute: 'required' }),
      slot({ id: 'c45-push-2', patterns: ['push'], variants: [v(reps(3, 10), 180)], venueAware: 'optional', substitute: 'required' }),
    ]),
    block('Finish', [
      slot({ id: 'c45-core-2', patterns: ['core'], variants: [v(hold(3, 30, 'per-side'), 240), v(hold(3, 30), 150)], venueAware: 'required', substitute: 'required' }),
      slot({ id: 'c45-mobility', patterns: ['mobility'], variants: [v(hold(1, 45, 'per-side'), 120)], venueAware: 'optional', substitute: 'required' }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

export const STRENGTH_POLICY: AuthoredGoalPolicy = {
  id: 'policy-strength' as GoalPolicyId,
  goal: 'strength',
  version: '1' as PolicyVersion,
  authority: PROJECT,
  programs: { 10: strength10, 20: strength20, 30: strength30, 45: strength45 },
};

export const CONDITIONING_POLICY: AuthoredGoalPolicy = {
  id: 'policy-conditioning' as GoalPolicyId,
  goal: 'conditioning',
  version: '1' as PolicyVersion,
  authority: PROJECT,
  programs: { 10: conditioning10, 20: conditioning20, 30: conditioning30, 45: conditioning45 },
};

export const AUTHORED_POLICIES: readonly AuthoredGoalPolicy[] = [
  STRENGTH_POLICY,
  CONDITIONING_POLICY,
];
