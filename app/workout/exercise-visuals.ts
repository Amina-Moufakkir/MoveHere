import type { StaticImageData } from 'next/image';
import daylightBench from '@/img/daylight-bench.png';
import darkBench from '@/img/dark-bench.png';
import outdoorSquat from '@/img/outdoor-bodyweight-squat.png';
import indoorDaylightSquat from '@/img/indoor-daylight-bodyweight-squat.png';
import indoorDarkSquat from '@/img/indoor-dark-bodyweight-squat.png';
import outdoorGluteBridge from '@/img/outdoor-glute-bridge.png';
import indoorDaylightGluteBridge from '@/img/indoor-daylight-glute-bridge.png';
import indoorDarkGluteBridge from '@/img/indoor-dark-glute-bridge.png';
import outdoorPlank from '@/img/outdoor-plank.png';
import indoorDaylightPlank from '@/img/indoor-daylight-plank.png';
import indoorDarkPlank from '@/img/indoor-dark-plank.png';
import { selectVisual, type ResolvedVisual, type SessionPresentation, type VisualEntry } from '@/src/presentation/exercise-visual.ts';
import type { ExerciseId } from '@/src/domain/exercise.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';

/**
 * Registered exercise visuals, web.
 *
 * The identities, the alt text and the aspect ratios are the same content the
 * native registry holds. The only thing that differs is how an asset is
 * referenced: Metro resolves `require`, Next resolves a static import into a
 * `StaticImageData` with intrinsic dimensions. `VisualEntry<A>` is generic over
 * the asset type for exactly this reason, so both clients share the selection
 * rule and supply their own asset values.
 *
 * **The duplication of alt text across two clients is a real drift risk**, and
 * it is not left to discipline. `npm run check:exercise-media` reads both
 * registries, fails on any identity present in one and missing from the other,
 * and fails on any alt string that differs between them. Two independently
 * edited descriptions of the same photograph would otherwise be exactly the
 * kind of divergence only one reviewer ever sees.
 *
 * The rows are not moved into shared source in this batch. That would be the
 * better architecture, and it means editing the native registry — a client the
 * root typecheck does not cover and that cannot be run here. A refactor whose
 * correctness could not be demonstrated is worse than a duplication a gate
 * enforces.
 *
 * **A registry entry illustrates a compatibility claim; it never creates one.**
 * The same build check fails on any pairing the matrix does not hold, so a
 * depiction cannot assert a movement is possible on a structure the domain
 * never authorised. Adding a picture is not a way to widen the product.
 *
 * These visuals are project-created and have not been reviewed by a qualified
 * fitness professional. Nothing here may imply otherwise (§8).
 */

interface RegistryRow {
  readonly exerciseId: string;
  /** The structure the depiction relies on. Null for environment-independent. */
  readonly featureId: SupportedFeatureId | null;
  readonly entry: VisualEntry<StaticImageData>;
}

const VISUALS: readonly RegistryRow[] = [
  {
    exerciseId: 'step-up',
    featureId: 'park-bench' as SupportedFeatureId,
    entry: {
      park: {
        asset: { light: daylightBench, dark: darkBench },
        alt: 'Bench step-up, in two phases: standing beside a park bench with one foot placed on the seat, then standing tall on the bench with the other knee driven up.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
  {
    exerciseId: 'bodyweight-squat',
    featureId: null,
    entry: {
      park: {
        asset: { both: outdoorSquat },
        alt: 'Two photographs of a bodyweight squat in a city park, side by side. On the left, a man stands with his feet apart and his arms held straight out in front of him. On the right, the same man part way into a squat, his hips moved back and down, his knees bent and lower than his hips, and both feet flat on the ground.',
      },
      substitute: {
        asset: { light: indoorDaylightSquat, dark: indoorDarkSquat },
        alt: 'Two stacked photographs of a bodyweight squat in a room. Above, a man stands with his feet apart and his arms held straight out in front of him. Below, the same man part way into a squat, his hips moved back and down, his knees bent and lower than his hips, and both feet flat on the wooden floor.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
  {
    exerciseId: 'glute-bridge',
    featureId: null,
    entry: {
      park: {
        asset: { both: outdoorGluteBridge },
        alt: 'Two stacked photographs of a glute bridge on the grass in a city park. Above, a woman lies on her back with her knees bent, her feet flat and her arms by her sides. Below, the same position with her hips raised so her body slopes from her shoulders to her knees.',
      },
      substitute: {
        asset: { light: indoorDaylightGluteBridge, dark: indoorDarkGluteBridge },
        alt: 'Two stacked photographs of a glute bridge in a room. Above, a man lies on his back on a wooden floor with his knees bent, his feet flat and his arms by his sides. Below, the same position with his hips raised so his body slopes from his shoulders to his knees.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
  {
    exerciseId: 'plank',
    featureId: null,
    entry: {
      park: {
        asset: { both: outdoorPlank },
        alt: 'A woman holds a forearm plank on the grass in a city park, seen from the side. Her forearms are on the ground with her elbows beneath her shoulders, her legs are straight, and her weight is on her forearms and the toes of both trainers.',
      },
      substitute: {
        asset: { light: indoorDaylightPlank, dark: indoorDarkPlank },
        alt: 'A person holds a forearm plank on the floor of a room, seen from the side. Their forearms are on the floor with their elbows beneath their shoulders, their legs are straight, and their weight is on their forearms and the toes of both trainers.',
      },
      aspectRatio: 1536 / 1024,
    },
  },
];

const key = (exerciseId: string, featureId: SupportedFeatureId | null): string =>
  `${exerciseId}@${featureId ?? '-'}`;

const INDEX = new Map(VISUALS.map((v) => [key(v.exerciseId, v.featureId), v.entry]));

export type ExerciseVisual = ResolvedVisual<StaticImageData>;

/**
 * The visual for this item, or null when none exists — still the case for most
 * of the catalog, and the caller renders nothing at all in that case.
 *
 * **Identity is unchanged by presentation.** The key is the exercise and the
 * feature the item cited; session and theme choose among the depictions found
 * under that key and never widen, narrow, or reroute it.
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
