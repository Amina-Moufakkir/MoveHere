// @expect TS2345 a policy cannot be selected without proven feasibility
import { selectPolicy } from '../../../src/domain/feasibility.ts';
import type { ValidatedMatrix } from '../../../src/domain/matrix-loader.ts';
import type { ValidatedPolicySet } from '../../../src/domain/policy-loader.ts';
declare const matrix: ValidatedMatrix;
declare const policies: ValidatedPolicySet;
export const policy = selectPolicy({ matrix, policies }, 'strength');
