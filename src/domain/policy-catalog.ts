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

const hold = (sets: number, seconds: number, counting: 'total' | 'per-side' = 'total'): Prescription => ({
  kind: 'time',
  sets,
  seconds,
  counting,
});

interface SlotSpec {
  readonly id: string;
  readonly patterns: readonly [MovementPattern, ...MovementPattern[]];
  readonly prescription: Prescription;
  readonly venueAware: SlotObligation;
  readonly substitute: SlotObligation;
  readonly estimatedSeconds: number;
}

const slot = (spec: SlotSpec): SlotTemplate => ({
  id: spec.id as SlotId,
  eligiblePatterns: spec.patterns,
  prescription: spec.prescription,
  obligation: { 'venue-aware': spec.venueAware, substitute: spec.substitute },
  sourcePreference: 'prefer-venue-feature',
  allowRepeatExercise: false,
  estimatedSeconds: spec.estimatedSeconds,
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
      slot({ id: 's10-squat', patterns: ['squat'], prescription: reps(3, 8), venueAware: 'required', substitute: 'required', estimatedSeconds: 80 }),
      slot({ id: 's10-push', patterns: ['push'], prescription: reps(3, 8), venueAware: 'required', substitute: 'required', estimatedSeconds: 80 }),
      slot({ id: 's10-hinge', patterns: ['hinge'], prescription: reps(3, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 80 }),
      slot({ id: 's10-pull', patterns: ['pull'], prescription: reps(3, 5), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 80 }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

const strength20 = program(
  [
    block('Strength', [
      slot({ id: 's20-squat', patterns: ['squat'], prescription: reps(3, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 's20-push', patterns: ['push'], prescription: reps(3, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 's20-hinge', patterns: ['hinge'], prescription: reps(3, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
    ]),
    block('Accessory', [
      slot({ id: 's20-pull-hold', patterns: ['pull'], prescription: hold(3, 20), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 120 }),
      slot({ id: 's20-squat-2', patterns: ['squat'], prescription: perSide(2, 8), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 's20-core', patterns: ['core'], prescription: hold(3, 30), venueAware: 'required', substitute: 'required', estimatedSeconds: 90 }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

const strength30 = program(
  [
    block('Strength', [
      slot({ id: 's30-squat', patterns: ['squat'], prescription: reps(4, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 's30-push', patterns: ['push'], prescription: reps(4, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 's30-hinge', patterns: ['hinge'], prescription: reps(4, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
    ]),
    block('Accessory', [
      slot({ id: 's30-pull', patterns: ['pull'], prescription: reps(3, 5), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 150 }),
      slot({ id: 's30-squat-2', patterns: ['squat'], prescription: perSide(3, 8), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 's30-core', patterns: ['core'], prescription: hold(3, 30), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
    ]),
    block('Finish', [
      slot({ id: 's30-core-2', patterns: ['core'], prescription: reps(2, 10), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 's30-mobility', patterns: ['mobility'], prescription: hold(1, 45, 'per-side'), venueAware: 'optional', substitute: 'required', estimatedSeconds: 90 }),
    ]),
  ],
  STRENGTH_REST_ITEM,
  STRENGTH_REST_BLOCK,
);

const strength45 = program(
  [
    block('Strength', [
      slot({ id: 's45-squat', patterns: ['squat'], prescription: reps(4, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 's45-hinge', patterns: ['hinge'], prescription: reps(4, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 's45-push', patterns: ['push'], prescription: reps(4, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
    ]),
    block('Accessory', [
      slot({ id: 's45-pull', patterns: ['pull'], prescription: reps(3, 5), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 180 }),
      slot({ id: 's45-squat-2', patterns: ['squat'], prescription: perSide(3, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 's45-push-2', patterns: ['push'], prescription: reps(3, 10), venueAware: 'optional', substitute: 'required', estimatedSeconds: 150 }),
    ]),
    block('Trunk', [
      slot({ id: 's45-hinge-2', patterns: ['hinge'], prescription: perSide(3, 8), venueAware: 'optional', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 's45-core', patterns: ['core'], prescription: hold(3, 40), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 's45-core-2', patterns: ['core'], prescription: reps(3, 10), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
    ]),
    block('Finish', [
      slot({ id: 's45-mobility', patterns: ['mobility'], prescription: hold(1, 45, 'per-side'), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 's45-mobility-2', patterns: ['mobility'], prescription: hold(1, 45, 'per-side'), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
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
      slot({ id: 'c10-loco', patterns: ['locomotion'], prescription: hold(1, 120), venueAware: 'required', substitute: 'required', estimatedSeconds: 130 }),
      slot({ id: 'c10-squat', patterns: ['squat'], prescription: reps(3, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 90 }),
      slot({ id: 'c10-push', patterns: ['push'], prescription: reps(3, 10), venueAware: 'required', substitute: 'required', estimatedSeconds: 90 }),
      slot({ id: 'c10-core', patterns: ['core'], prescription: hold(3, 30), venueAware: 'required', substitute: 'required', estimatedSeconds: 90 }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

const conditioning20 = program(
  [
    block('Build', [
      slot({ id: 'c20-loco', patterns: ['locomotion'], prescription: hold(1, 180), venueAware: 'required', substitute: 'required', estimatedSeconds: 190 }),
    ]),
    block('Circuit', [
      slot({ id: 'c20-squat', patterns: ['squat'], prescription: reps(3, 15), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 'c20-push', patterns: ['push'], prescription: reps(3, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 'c20-core', patterns: ['core'], prescription: hold(3, 30), venueAware: 'required', substitute: 'required', estimatedSeconds: 120 }),
      slot({ id: 'c20-hinge', patterns: ['hinge'], prescription: reps(3, 12), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
    ]),
    block('Finish', [
      slot({ id: 'c20-loco-2', patterns: ['locomotion'], prescription: hold(1, 150), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 160 }),
      slot({ id: 'c20-core-2', patterns: ['core'], prescription: reps(2, 10), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 90 }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

const conditioning30 = program(
  [
    block('Build', [
      slot({ id: 'c30-loco', patterns: ['locomotion'], prescription: hold(1, 240), venueAware: 'required', substitute: 'required', estimatedSeconds: 250 }),
    ]),
    block('Circuit', [
      slot({ id: 'c30-squat', patterns: ['squat'], prescription: reps(4, 15), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 'c30-push', patterns: ['push'], prescription: reps(4, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 'c30-core', patterns: ['core'], prescription: hold(4, 30), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 'c30-hinge', patterns: ['hinge'], prescription: reps(3, 12), venueAware: 'optional', substitute: 'required', estimatedSeconds: 150 }),
    ]),
    block('Finish', [
      slot({ id: 'c30-loco-2', patterns: ['locomotion'], prescription: hold(1, 180), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 190 }),
      slot({ id: 'c30-squat-2', patterns: ['squat'], prescription: perSide(3, 10), venueAware: 'optional', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 'c30-core-2', patterns: ['core'], prescription: reps(3, 10), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
    ]),
  ],
  COND_REST_ITEM,
  COND_REST_BLOCK,
);

const conditioning45 = program(
  [
    block('Build', [
      slot({ id: 'c45-loco', patterns: ['locomotion'], prescription: hold(1, 300), venueAware: 'required', substitute: 'required', estimatedSeconds: 310 }),
    ]),
    block('Circuit', [
      slot({ id: 'c45-squat', patterns: ['squat'], prescription: reps(4, 15), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 'c45-push', patterns: ['push'], prescription: reps(4, 12), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 'c45-core', patterns: ['core'], prescription: hold(4, 40), venueAware: 'required', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 'c45-hinge', patterns: ['hinge'], prescription: reps(4, 12), venueAware: 'optional', substitute: 'required', estimatedSeconds: 180 }),
    ]),
    block('Intervals', [
      slot({ id: 'c45-loco-2', patterns: ['locomotion'], prescription: hold(1, 240), venueAware: 'optional', substitute: 'optional', estimatedSeconds: 250 }),
      slot({ id: 'c45-squat-2', patterns: ['squat'], prescription: perSide(3, 12), venueAware: 'optional', substitute: 'required', estimatedSeconds: 180 }),
      slot({ id: 'c45-push-2', patterns: ['push'], prescription: reps(3, 10), venueAware: 'optional', substitute: 'required', estimatedSeconds: 180 }),
    ]),
    block('Finish', [
      slot({ id: 'c45-core-2', patterns: ['core'], prescription: hold(3, 30), venueAware: 'required', substitute: 'required', estimatedSeconds: 150 }),
      slot({ id: 'c45-mobility', patterns: ['mobility'], prescription: hold(1, 45, 'per-side'), venueAware: 'optional', substitute: 'required', estimatedSeconds: 120 }),
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
