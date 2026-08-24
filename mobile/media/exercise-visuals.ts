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
import {
  selectVisual,
  type ResolvedVisual,
  type SessionPresentation,
  type VisualEntry,
} from '../../src/presentation/exercise-visual.ts';

/** What the player renders: one asset, its description, its true ratio. */
export type ExerciseVisual = ResolvedVisual<ImageSourcePropType>;

interface RegistryRow {
  readonly exerciseId: string;
  /** The structure the depiction relies on. Null for environment-independent. */
  readonly featureId: SupportedFeatureId | null;
  readonly entry: VisualEntry<ImageSourcePropType>;
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
const VISUALS: readonly RegistryRow[] = [
  {
    exerciseId: 'step-up',
    featureId: 'park-bench',
    entry: {
      /* Feature-keyed, so the environment is fixed by the basis: a confirmed
         park bench exists only in a park. No substitute composition, and the
         selector is never asked for one. */
      park: {
        asset: {
          light: require('../../img/daylight-bench.png'),
          dark: require('../../img/dark-bench.png'),
        },
        alt: 'Bench step-up, in two phases: standing beside a park bench with one foot placed on the seat, then standing tall on the bench with the other knee driven up.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
  {
    exerciseId: 'bodyweight-squat',
    featureId: null,
    entry: {
      /* Two ordered phases, standing then a descent that stays clearly above
         the discarded thigh-parallel endpoint. The park composition runs left
         to right; the two substitute compositions stack top to bottom. Both
         layouts are permitted, and the ordering is what carries the sequence.
         All three are 1536 x 1024, measured. */
      park: {
        asset: { both: require('../../img/outdoor-bodyweight-squat.png') },
        alt: 'Two photographs of a bodyweight squat in a city park, side by side. On the left, a man in a grey T-shirt and black shorts stands with his feet apart and his arms held straight out in front of him. On the right, the same man part way into a squat, his hips moved back and down, his knees bent and lower than his hips, and both feet flat on the path. A bench, a lamp post, a railing, trees, water and a distant skyline are behind him.',
      },
      substitute: {
        /* One alt for the themed pair: the same man in the same clothing makes
           the same two positions in both, and the alt describes neither the
           room lighting nor its decor, which is all that differs. */
        asset: {
          light: require('../../img/indoor-daylight-bodyweight-squat.png'),
          dark: require('../../img/indoor-dark-bodyweight-squat.png'),
        },
        alt: 'Two stacked photographs of a bodyweight squat in a room. Above, a man in a T-shirt and shorts stands with his feet apart and his arms held straight out in front of him. Below, the same man part way into a squat, his hips moved back and down, his knees bent and lower than his hips, and both feet flat on the wooden floor. A window, a potted plant, a framed print and a shelf holding books and baskets are behind him.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
  {
    exerciseId: 'glute-bridge',
    featureId: null,
    entry: {
      /* Two stacked phases in one frame — start above, hips raised below. The
         stacked layout is the brief's, not this file's: a supine movement shot
         side-on is wider than tall, so stacking gives each pose the full width.
         All three assets are 1536 x 1024, measured. */
      park: {
        asset: { both: require('../../img/outdoor-glute-bridge.png') },
        alt: 'Two stacked photographs of a glute bridge in a city park. Above, a woman in a black crop top and shorts lies on her back on the grass with her knees bent, her feet flat and her arms by her sides. Below, the same position with her hips raised so her body slopes from her shoulders to her knees. A path, a bench, a lamp post, water and a distant skyline are behind her.',
      },
      substitute: {
        /* One alt covers the themed pair because both show the same person in
           the same clothing and the same two positions; only the room lighting
           and its decor differ, and neither is described. */
        asset: {
          light: require('../../img/indoor-daylight-glute-bridge.png'),
          dark: require('../../img/indoor-dark-glute-bridge.png'),
        },
        alt: 'Two stacked photographs of a glute bridge in a room. Above, a man in a grey T-shirt and shorts lies on his back on a wooden floor with his knees bent, his feet flat and his arms by his sides. Below, the same position with his hips raised so his body slopes from his shoulders to his knees. A window and a potted plant are behind him.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
  {
    exerciseId: 'plank',
    featureId: null,
    entry: {
      /* One theme-neutral outdoor composition, and a themed indoor pair. All
         three are 1536 x 1024, measured, so the ratio is true of the entry. */
      park: {
        asset: { both: require('../../img/outdoor-plank.png') },
        alt: 'A woman in a black crop top and shorts holds a forearm plank on open grass in a city park, seen from the side. Her forearms rest on the grass with her elbows beneath her shoulders, her legs are straight, and her weight is on her forearms and the toes of both trainers. A path, an empty bench, a lamp post, water and a distant skyline are behind her.',
      },
      substitute: {
        asset: {
          light: require('../../img/indoor-daylight-plank.png'),
          dark: require('../../img/indoor-dark-plank.png'),
        },
        alt: 'A person holds a forearm plank on a smooth indoor floor, seen from the side. Their forearms rest on the floor with their elbows beneath their shoulders, their legs are straight, and their weight is on their forearms and the toes of both trainers.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
];

const key = (exerciseId: string, featureId: SupportedFeatureId | null): string =>
  `${exerciseId}@${featureId ?? '-'}`;

const INDEX = new Map(VISUALS.map((v) => [key(v.exerciseId, v.featureId), v.entry]));

/**
 * The visual for this item, or null when none exists yet — still the case for
 * most of the catalog.
 *
 * **Identity is unchanged by presentation.** The key is the exercise and the
 * feature the item cited, exactly as before; session and theme choose among the
 * depictions found under that key and never widen, narrow, or reroute it. A
 * movement in a substitute session is the same movement with the same key.
 */
export const exerciseVisualFor = (
  exerciseId: ExerciseId,
  featureId: SupportedFeatureId | null,
  session: SessionPresentation,
  dark: boolean,
): ExerciseVisual | null => {
  const entry = INDEX.get(key(String(exerciseId), featureId));
  return entry === undefined ? null : selectVisual(entry, session, dark);
};
