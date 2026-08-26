/**
 * Feature pictogram geometry.
 *
 * Path data only — no rendering. SVG path strings are pure data, and each
 * client draws them with its own SVG implementation: `<svg>` on the web,
 * react-native-svg on the device.
 *
 * Shared because a divergence here would mean the two clients depict the same
 * feature differently. The glyph is the primary way a tile is recognised at a
 * glance, so a bench that looks like one thing in a browser and another on a
 * phone is a recognition failure, not a styling difference.
 *
 * Drawn on a 24 grid and used large. Rounded joins and open forms to match Open
 * Air's geometry. Stroke weight, colour, and size belong to the client.
 */

import type { SessionGoal } from '../domain/session.ts';

/** Every glyph is drawn in this coordinate space. */
export const GLYPH_VIEWBOX = '0 0 24 24';

/** Stroke geometry the marks were drawn for. Clients apply their own colour. */
export const GLYPH_STROKE = {
  width: 1.75,
  linecap: 'round',
  linejoin: 'round',
} as const;

/**
 * Keyed by SupportedFeatureId, plus a fallback.
 *
 * Deliberately a plain record rather than an exhaustive map over
 * SupportedFeatureId: a registry entry with no glyph yet should render the
 * fallback rather than fail to compile, so adding a feature is not blocked on
 * drawing one.
 */
export const FEATURE_GLYPH_PATHS: Record<string, readonly string[]> = {
  /* Seat, legs, and a backrest. The backrest is what distinguishes a bench
     from parallel bars — without it the two were a pair of rails and a pair of
     rails, indistinguishable at tile size on the one screen whose whole job is
     telling park objects apart. */
  'park-bench': ['M3 13.5h18', 'M6.5 13.5v6', 'M17.5 13.5v6', 'M17.5 13.5V5.5', 'M8 9h9.5'],
  'pull-up-bar': ['M3 6h18', 'M6.5 6v14', 'M17.5 6v14', 'M9.5 6v3.5', 'M14.5 6v3.5'],
  'parallel-bars': ['M3 9h18', 'M3 15h18', 'M6.5 9v11', 'M17.5 9v11'],
  stairs: ['M3 20h4.5v-4.5H12V11h4.5V6.5H21'],
  hill: ['M2 18.5l6.5-9 4 4.5 3.5-4.5 6 9z'],
  'walking-running-path': ['M7 20.5c0-6 10-4.5 10-9s-7-4-7-8'],
  // A single stadium outline with lane ticks. Nested outlines read as an eye
  // at tile size, which is worse than being slightly abstract.
  'running-track': ['M8 6.5h8a5.5 5.5 0 0 1 0 11H8a5.5 5.5 0 0 1 0-11z'],
  'hard-court': ['M3.5 5.5h17v13h-17z', 'M12 5.5v13', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5'],
};

/** A featureless dash, so an unknown id renders something rather than nothing. */
export const FALLBACK_GLYPH_PATHS: readonly string[] = ['M4 12h16'];

export const glyphPathsFor = (id: string): readonly string[] =>
  FEATURE_GLYPH_PATHS[id] ?? FALLBACK_GLYPH_PATHS;

/** The confirmation tick. Drawn on a 20 grid, heavier stroke. */
export const CHECK_VIEWBOX = '0 0 20 20';
export const CHECK_PATH = 'M4.5 10.5l3.5 3.5 7.5-8';
export const CHECK_STROKE_WIDTH = 2.75;

/**
 * Session-goal marks — a separate icon subsystem, deliberately.
 *
 * MoveHere has two kinds of mark and they are not the same job:
 *
 *   · **Environment glyphs** depict physical structures — a bench, a bar, a
 *     staircase. Those are line structures in the world, so they are line
 *     structures here, and the stroke system above renders them well.
 *
 *   · **Goal marks** communicate a fitness concept rather than an object. A
 *     flexed arm carries its meaning through silhouette mass — the bicep read
 *     against the limb — and three attempts to force it into thin open strokes
 *     produced a squiggle, then a form close enough to the stairs glyph to be
 *     confusable, then a shape resembling a flag. Mass is the meaning, so these
 *     may use fill.
 *
 * The two subsystems are matched on **optical weight at the rendered size**,
 * not on path construction. Forcing identical construction is what broke the
 * arm; a filled arm beside a hairline heart would be the same mistake from the
 * other direction, so the heart is filled too and carries its pulse as a
 * knockout in the surface colour.
 *
 * Do not "fix" these into the stroke system. The difference is the point.
 */
export interface GoalMark {
  /** Painted in the mark's own colour. */
  readonly fill: readonly string[];
  /** Painted in the surface colour, cutting through the fill. */
  readonly knockout?: readonly string[];
  readonly knockoutWidth?: number;
}

export const GOAL_MARKS: Record<SessionGoal, GoalMark> = {
  /* A flexed arm: upper arm along the bottom, forearm rising at the right,
     and the bicep as the swell across the top. */
  strength: {
    /*
     * Composed from primitives rather than one hand-fitted outline: an upper-arm
     * capsule, a forearm capsule rising from the elbow, and the bicep as a disc
     * overlapping their junction. Filled paths union, so the three read as one
     * limb — and each piece can be reasoned about, which four attempts at a
     * single traced contour could not.
     */
    fill: [
      'M3.5 16h8.5a2.4 2.4 0 0 1 0 4.8H3.5a2.4 2.4 0 0 1 0-4.8z',
      'M16 4a2.4 2.4 0 0 1 2.4 2.4v12a2.4 2.4 0 0 1-4.8 0V6.4A2.4 2.4 0 0 1 16 4z',
      'M9 10.2a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2z',
    ],
  },
  /* A heart carrying a pulse: sustained effort rather than maximal effort. */
  conditioning: {
    fill: ['M12 20.4 4.9 13.3a4.6 4.6 0 1 1 6.5-6.5l.6.6.6-.6a4.6 4.6 0 1 1 6.5 6.5z'],
    knockout: ['M6.4 12.3h2.5l1.5-3.1 2.4 5.4 1.5-3.1 1 .8h3.1'],
    knockoutWidth: 2,
  },
};

export const goalMarkFor = (goal: SessionGoal): GoalMark => GOAL_MARKS[goal];

/**
 * Marketing pictograms.
 *
 * The same 24-grid, the same stroke, the same open forms as the feature glyphs
 * above — deliberately, because the landing page had drifted to four different
 * stroke weights (1.75, 1.8, 1.9, 2.25) and three optical sizes across four
 * files. Icons drawn to different weights read as borrowed from different
 * places, which is precisely what a brand surface cannot afford.
 *
 * Here rather than in a web component for the same reason the feature glyphs
 * are here: path data is platform-neutral, and a mark that exists in only one
 * client is a mark that will diverge. No icon dependency is added, and none is
 * needed — these are ten short paths.
 *
 * Keyed by role rather than by picture. `complete` may stop being a flag; it
 * will not stop being completion.
 */
export type MarketingGlyph =
  | 'confirm'
  | 'time'
  | 'workout'
  | 'complete'
  | 'park'
  | 'person'
  | 'adaptive'
  | 'progress'
  | 'equipment'
  | 'goal'
  | 'trust';

export const MARKETING_GLYPH_PATHS: Record<MarketingGlyph, readonly string[]> = {
  /* Hero — the four steps of the loop. */
  confirm: ['M20.5 6.5 9.5 17.5 4 12'],
  time: ['M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z', 'M12 7.2V12l3.2 2.1'],
  workout: ['M4 7h11', 'M4 12h16', 'M4 17h8'],
  complete: ['M6 20.5V4', 'M6 4.5h11.5l-2.6 4 2.6 4H6'],

  /* Strip — a tree with a trunk, not a lollipop: the crown is three arcs so it
     survives at 24px, where a single circle reads as a balloon. */
  park: ['M12 21v-5.5', 'M12 15.5a5.2 5.2 0 0 0 4.2-8.2 4.4 4.4 0 0 0-8.4 0A5.2 5.2 0 0 0 12 15.5z'],
  person: ['M12 4.2a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z', 'M4.8 20.2a7.2 7.2 0 0 1 14.4 0'],
  /* Two lobes and a midline. Drawn to fill the grid: an earlier version sat at
     roughly half scale and read as a blob beside four icons that did not. */
  adaptive: [
    'M12 4.4a3.9 3.9 0 0 0-3.8 3 3.4 3.4 0 0 0-1.7 6.1A3.6 3.6 0 0 0 9.9 20a3.3 3.3 0 0 0 2.1-.8z',
    'M12 4.4a3.9 3.9 0 0 1 3.8 3 3.4 3.4 0 0 1 1.7 6.1A3.6 3.6 0 0 1 14.1 20a3.3 3.3 0 0 1-2.1-.8z',
    'M12 4.4v14.8',
  ],
  progress: ['M4 20h16', 'M7.5 20v-5', 'M12 20V9.5', 'M16.5 20v-8'],

  /* Lower benefit row. */
  equipment: ['M4.5 8.5h15l-1.1 11.2H5.6z', 'M9 8.5V6.4a3 3 0 0 1 6 0v2.1'],
  goal: [
    'M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8z',
    'M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z',
  ],

  /* The trust line's shield. Not a marketing claim — it marks the sentence that
     says what MoveHere does not ask of you. */
  trust: ['M12 3l7.5 3v5.5c0 4.3-3 8.2-7.5 9.5-4.5-1.3-7.5-5.2-7.5-9.5V6z'],
};
