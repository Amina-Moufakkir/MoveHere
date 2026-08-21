/**
 * What the user reports about conditions (§6 step 5), and how it enters the
 * domain.
 *
 * An app-level input rather than a domain type: the domain takes a
 * ConditionsAssessment, and this module maps one to the other. It is shared by
 * both clients because the mapping is a product decision, not a UI detail —
 * "not sure" withholding the park is the same decision on a phone as in a
 * browser.
 *
 * Deliberately its own module rather than living beside the session builder.
 * Persisted session state has to validate a reported value, and importing the
 * builder for that would pull the whole content-loading module — and its
 * module-scope feasibility check — into the storage layer for the sake of one
 * string union.
 */

import type { ConditionsAssessment } from '../domain/session.ts';

export const REPORTED_CONDITIONS = ['acceptable', 'adverse', 'unknown'] as const;

export type ReportedConditions = (typeof REPORTED_CONDITIONS)[number];

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
