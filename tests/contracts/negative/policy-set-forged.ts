// @expect TS2741 a validated policy set cannot be assembled outside its loader
import type { ValidatedPolicySet } from '../../../src/domain/policy-loader.ts';
declare const byGoal: ValidatedPolicySet['byGoal'];
export const forged: ValidatedPolicySet = { authorityTier: 'reviewed', byGoal };
