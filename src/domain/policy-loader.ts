/**
 * Policy validation boundary (§8).
 *
 * Only this module can produce a ValidatedPolicySet, and only presentable
 * policies enter one. Draft policy cannot reach production generation.
 */

import type {
  AuthoredGoalPolicy,
  GoalPolicyId,
  SlotTemplate,
  GenerationContextKind,
} from './policy.ts';
import type { ContentAuthority, PresentableAuthority } from './exercise.ts';
import type { SessionGoal } from './session.ts';
import { SESSION_DURATIONS } from './session.ts';

type NonEmpty<T> = readonly [T, ...T[]];

/** Every supported goal. Narrowing SessionGoal automatically narrows this. */
const SUPPORTED_GOALS: readonly SessionGoal[] = ['strength', 'conditioning'];

export const GENERATION_CONTEXTS: readonly GenerationContextKind[] = ['venue-aware', 'substitute'];

export type UsableGoalPolicy = AuthoredGoalPolicy & { readonly authority: PresentableAuthority };

declare const policySetWitness: unique symbol;

/**
 * Policies that passed validation.
 *
 * Exhaustive over SessionGoal by type, so selecting a policy for a goal cannot
 * fail and needs no error case.
 */
export interface ValidatedPolicySet {
  readonly [policySetWitness]: true;
  /** The weakest authority present, mirroring ValidatedMatrix. */
  readonly authorityTier: PresentableAuthority['status'];
  readonly byGoal: { readonly [G in SessionGoal]: UsableGoalPolicy };
}

export interface DroppedPolicy {
  readonly id: GoalPolicyId;
  readonly goal: SessionGoal;
  readonly reason: 'draft';
}

export type PolicyValidationFailure =
  | { readonly kind: 'missing-goal'; readonly goal: SessionGoal }
  | { readonly kind: 'duplicate-goal'; readonly goal: SessionGoal }
  | { readonly kind: 'duplicate-slot-id'; readonly slotId: string }
  | { readonly kind: 'unsourced-content'; readonly id: GoalPolicyId }
  | { readonly kind: 'non-positive-value'; readonly at: string }
  | { readonly kind: 'no-required-slot'; readonly goal: SessionGoal; readonly duration: number; readonly context: GenerationContextKind };

export type PolicySetLoadResult =
  | {
      readonly ok: true;
      readonly policies: ValidatedPolicySet;
      readonly dropped: readonly DroppedPolicy[];
    }
  | { readonly ok: false; readonly failures: NonEmpty<PolicyValidationFailure> };

export type LoadGoalPolicies = (authored: readonly AuthoredGoalPolicy[]) => PolicySetLoadResult;

const isPresentable = (a: ContentAuthority): a is PresentableAuthority => a.status !== 'draft';

const hasSources = (a: ContentAuthority): boolean =>
  a.status === 'project-content'
    ? a.basisRefs.length > 0
    : a.status === 'reviewed'
      ? a.sourceRefs.length > 0
      : true;

const asPolicySet = (value: Omit<ValidatedPolicySet, typeof policySetWitness>): ValidatedPolicySet =>
  value as ValidatedPolicySet;

export const loadGoalPolicies: LoadGoalPolicies = (authored) => {
  const failures: PolicyValidationFailure[] = [];
  const dropped: DroppedPolicy[] = [];
  const byGoal = new Map<SessionGoal, UsableGoalPolicy>();
  const slotIds = new Set<string>();

  for (const policy of authored) {
    if (!hasSources(policy.authority)) {
      failures.push({ kind: 'unsourced-content', id: policy.id });
      continue;
    }
    if (!isPresentable(policy.authority)) {
      dropped.push({ id: policy.id, goal: policy.goal, reason: 'draft' });
      continue;
    }
    if (byGoal.has(policy.goal)) {
      failures.push({ kind: 'duplicate-goal', goal: policy.goal });
      continue;
    }

    for (const duration of SESSION_DURATIONS) {
      const program = policy.programs[duration];
      const at = `${policy.goal} ${duration}min`;

      if (program.restBetweenItemsSeconds < 0 || program.restBetweenBlocksSeconds < 0) {
        failures.push({ kind: 'non-positive-value', at: `${at} rest` });
      }

      const slots: SlotTemplate[] = program.blocks.flatMap((b) => [...b.slots]);
      for (const s of slots) {
        if (slotIds.has(s.id)) failures.push({ kind: 'duplicate-slot-id', slotId: s.id });
        slotIds.add(s.id);
        if (s.estimatedSeconds <= 0) {
          failures.push({ kind: 'non-positive-value', at: `${at} slot ${s.id} estimate` });
        }
        if (!isPositivePrescription(s)) {
          failures.push({ kind: 'non-positive-value', at: `${at} slot ${s.id} prescription` });
        }
      }

      // A program with no required slot could empty every block, which the
      // non-empty session types forbid at the output boundary.
      for (const context of GENERATION_CONTEXTS) {
        if (!slots.some((s) => s.obligation[context] === 'required')) {
          failures.push({ kind: 'no-required-slot', goal: policy.goal, duration, context });
        }
      }
    }

    byGoal.set(policy.goal, policy as UsableGoalPolicy);
  }

  for (const goal of SUPPORTED_GOALS) {
    if (!byGoal.has(goal)) failures.push({ kind: 'missing-goal', goal });
  }

  const [first, ...rest] = failures;
  if (first !== undefined) return { ok: false, failures: [first, ...rest] };

  const entries = [...byGoal.entries()];
  const tier: PresentableAuthority['status'] = entries.some(
    ([, p]) => p.authority.status === 'project-content',
  )
    ? 'project-content'
    : 'reviewed';

  return {
    ok: true,
    policies: asPolicySet({
      authorityTier: tier,
      byGoal: Object.fromEntries(entries) as ValidatedPolicySet['byGoal'],
    }),
    dropped,
  };
};

const isPositivePrescription = (s: SlotTemplate): boolean => {
  const p = s.prescription;
  if (p.kind === 'reps') return p.sets > 0 && p.reps > 0;
  if (p.kind === 'time') return p.sets > 0 && p.seconds > 0;
  return p.meters > 0;
};
