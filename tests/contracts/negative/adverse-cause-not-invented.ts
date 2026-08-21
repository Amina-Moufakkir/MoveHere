// @expect TS2353 adverse conditions cannot carry a signal the user never gave
import type { ConditionsAssessment } from '../../../src/domain/session.ts';
// The UI asks only whether conditions are bad, never why. Attaching a specific
// cause to a user report would assert something they did not say.
export const fabricated: ConditionsAssessment = {
  kind: 'adverse',
  cause: { kind: 'user-reported', signals: ['precipitation'] },
};
