// @expect TS2322 a reviewed compatibility claim must carry a review date
import type { ContentAuthority } from '../../../src/domain/exercise.ts';
export const review: ContentAuthority = { status: 'reviewed' };
