// @expect TS2322 draft content cannot be typed as presentable
import type { PresentableAuthority } from '../../../src/domain/exercise.ts';
export const draft: PresentableAuthority = { status: 'draft' };
