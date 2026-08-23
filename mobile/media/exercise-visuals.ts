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
 * The rule exists because the first drafts broke it. They were full
 * instructional cards, and integrating them would have put four problems on the
 * workout screen at once: their cue text disagreed with the matrix — "drive
 * through the heel" against the exercise's "drive through the top leg", a
 * different instruction rather than a rewording — they carried a muscles-worked
 * panel the app has never had and no reviewer has seen, their text rendered at
 * about six points on a phone, which is worse than absent because it looks like
 * information, and their near-square ratio letterboxed while pushing the cues
 * below the fold.
 *
 * **The shipped Bench Step-up asset is a superseded style draft.** It carries
 * phase labels, a direction arrow, and branded footwear, none of which the
 * production brief permits. Its mapping and its authority are untouched — it is
 * still this exercise on this structure, still project content, still the thing
 * the workout screen shows for that pairing — but it is not the reference the
 * rest of the set is produced against, and the specimen slot stays vacant until
 * a corrected asset is approved.
 *
 * The composition rules that reference must satisfy — ratio, cast, what may be
 * in frame, the phase convention, how the dark master derives from the daylight
 * one — are written once as the production brief in
 * `docs/exercise-media-manifest.md`. They are not restated here, because a
 * second copy of them is the copy nobody updates.
 *
 * What that brief does not relax is this index. Where a movement is identical
 * across contexts the approved pose may be reused between assets, but the
 * entries never merge: each key keeps its own file and its own row, because the
 * key is what ties a depiction to the basis the screen actually cited.
 *
 * Entries are keyed by the movement *as performed on a specific structure*, and
 * `aspectRatio` is the asset's true ratio: the slot sizes itself from the asset
 * rather than the asset being squeezed into a slot.
 *
 * **A visual may only claim what the matrix already claims.** A depiction of a
 * bench maps to that exercise performed with a bench, and to nothing else —
 * adding an entry does not create compatibility, it illustrates compatibility
 * that generation already established. `npm run check:exercise-media` fails the
 * build on any pair the matrix does not hold, so a depiction cannot quietly
 * assert a movement is possible on a structure the domain never authorised.
 *
 * Authority is unchanged by any of this. These visuals are project-created and
 * have not been reviewed by a qualified fitness professional. That review is a
 * commercialization gate, not a gate on the school build, and nothing here —
 * copy, label, or badge — may imply that a trainer has approved a depiction.
 */
const VISUALS: readonly VisualEntry[] = [
  {
    exerciseId: 'step-up',
    featureId: 'park-bench',
    visual: {
      light: require('../../img/daylight-bench.png'),
      dark: require('../../img/dark-bench.png'),
      alt: 'Bench step-up, in two phases: standing beside a park bench with one foot placed on the seat, then standing tall on the bench with the other knee driven up.',
      aspectRatio: 1536 / 1024,
    },
  },
];

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
