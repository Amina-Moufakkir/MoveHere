// @expect TS2322 a reviewed compatibility claim must carry a review date
import type { CompatibilityReview } from '../../../src/domain/exercise.ts';
export const review: CompatibilityReview = { status: 'reviewed' };
