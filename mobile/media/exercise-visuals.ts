/**
 * Instructional visuals, resolved per generated item.
 *
 * Presentation data only. Nothing here reaches generation, compatibility,
 * prescriptions, SelectionBasis, or content authority — a visual is something
 * the player may show, never something the session is built from. A missing
 * visual is a valid, expected state.
 *
 * **Keyed by exercise *and* the feature the item cites, not by either alone.**
 *
 * Keying by feature would put this bench card on any bench movement — an
 * incline push-up is not a step-up. But keying by exercise alone is also wrong
 * here, and less obviously so: `step-up` is compatible with both `park-bench`
 * and `stairs`, so a card depicting a bench would appear on a step-up the
 * generator sourced from a staircase. Same error, opposite direction.
 *
 * So the unit is the movement *as performed on a specific structure*. An
 * environment-independent movement keys on the exercise alone, with a null
 * feature.
 *
 * Asset binding stays in the native client. `require` is bundler semantics, and
 * making shared source depend on it would buy nothing for the web client, which
 * resolves images a different way.
 */
import type { ImageSourcePropType } from 'react-native';
import type { ExerciseId } from '../../src/domain/exercise.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';

export interface ExerciseVisual {
  readonly light: ImageSourcePropType;
  readonly dark: ImageSourcePropType;
  /** Read by assistive technology in place of the image. */
  readonly alt: string;
  /** Intrinsic ratio, so the slot can size without distorting. */
  readonly aspectRatio: number;
}

interface VisualEntry {
  readonly exerciseId: string;
  /** The structure the depiction relies on. Null for environment-independent. */
  readonly featureId: SupportedFeatureId | null;
  readonly visual: ExerciseVisual;
}

/**
 * **The visual demonstrates the movement; the app owns the instruction.**
 *
 * That rule decides what may be inside an asset. Exercise media carries the
 * movement depiction and whatever environmental structure the movement needs —
 * a bench, a bar, a step — and nothing else. No cue text, no muscle claims, no
 * prescriptions, no titles, no provenance. Those all already exist in the app,
 * where they are versioned, reviewed as content, and rendered at a size a
 * person can read.
 *
 * The registry is empty on purpose.
 *
 * The first drafts were full instructional cards, and integrating them would
 * have put four separate problems on the workout screen at once. Their cue text
 * disagreed with the matrix — the card said "drive through the heel" where the
 * exercise says "drive through the top leg", which is a different instruction,
 * not a rewording. They carried a "muscles worked" panel the app has never had
 * and no reviewer has seen. At phone size their text rendered around six
 * points, which is worse than absent because it looks like information. And
 * their near-square ratio letterboxed in the slot while pushing the cues below
 * the fold.
 *
 * So the mapping stays and the assets do not. Every movement falls back to the
 * environment glyph or the neutral no-equipment treatment, exactly as before,
 * until replacement assets exist that follow the rule above.
 *
 * When they do, an entry looks like this — keyed by the movement *as performed
 * on a specific structure*:
 *
 *     {
 *       exerciseId: 'step-up',
 *       featureId: 'park-bench',
 *       visual: { light, dark, alt, aspectRatio },
 *     }
 *
 * Anything added here is provisional project-created content until a qualified
 * fitness professional has reviewed it. Nothing may be labelled approved,
 * verified, or authoritative, and the §8 provenance language does not change to
 * accommodate it.
 */
const VISUALS: readonly VisualEntry[] = [];

const key = (exerciseId: string, featureId: SupportedFeatureId | null): string =>
  `${exerciseId}@${featureId ?? '-'}`;

const INDEX = new Map(VISUALS.map((v) => [key(v.exerciseId, v.featureId), v.visual]));

/**
 * The visual for this item, or null when none exists yet — which is the case
 * for all but one of the movements in the catalog.
 */
export const exerciseVisualFor = (
  exerciseId: ExerciseId,
  featureId: SupportedFeatureId | null,
): ExerciseVisual | null => INDEX.get(key(String(exerciseId), featureId)) ?? null;
