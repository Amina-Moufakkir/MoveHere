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
  'park-bench': ['M3 14h18', 'M3 10h18', 'M6 14v6', 'M18 14v6', 'M5.5 10V8', 'M18.5 10V8'],
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
