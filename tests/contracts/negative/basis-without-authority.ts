// @expect TS2322 a selection cannot cite a feature without naming the reviewed claim
import type { SelectionBasis } from '../../../src/domain/session.ts';
export const unfounded: SelectionBasis = { kind: 'confirmed-feature', featureId: 'park-bench' };
