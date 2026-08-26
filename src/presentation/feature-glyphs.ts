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
 * The same 24-grid and the same stroke as the feature glyphs above — the
 * landing page had drifted to four stroke weights across four files, and icons
 * drawn to different weights read as borrowed from different places.
 *
 * **These are drawn from the approved anchor, not invented to fit a label.**
 * An earlier set was internally consistent and wrong: a generic check, clock,
 * list and flag where the anchor shows a pin, a dumbbell, a convergence mark
 * and a circled check. Consistency is necessary and not sufficient — a coherent
 * set that resembles nothing in the design is still a miss.
 *
 * Where the anchor's picture would assert something MoveHere cannot do, the
 * metaphor moves and the drawing style stays. The anchor pairs a person with
 * "Works Anywhere"; our slot says "No Equipment? No Problem.", so it takes the
 * anchor's own equipment bag instead. Current semantics beat slot identity.
 *
 * A few marks carry filled shapes — the pin's dot, the badge leaf, the play
 * triangle — because the anchor draws them filled and an outlined version reads
 * as a different mark at 14-28px.
 *
 * Keyed by role rather than by picture. `complete` may stop being a circled
 * check; it will not stop being completion.
 */
export type MarketingGlyph =
  | 'place'
  | 'time'
  | 'dumbbell'
  | 'complete'
  | 'substitute'
  | 'tree'
  | 'person'
  | 'brain'
  | 'progress'
  | 'equipment'
  | 'goal'
  | 'trust'
  | 'leaf'
  | 'chevron'
  | 'play';

export interface GlyphDef {
  /** Drawn with the shared stroke. */
  readonly stroke?: readonly string[];
  /** Drawn filled, for marks the anchor draws solid. */
  readonly fill?: readonly string[];
}

const CIRCLE = 'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z';

export const MARKETING_GLYPHS: Record<MarketingGlyph, GlyphDef> = {
  /* Hero. The anchor's teardrop with a solid centre — an outlined dot reads as
     a ring and loses the pin. */
  place: {
    stroke: ['M12 21.2s6.6-6.3 6.6-10.7a6.6 6.6 0 1 0-13.2 0c0 4.4 6.6 10.7 6.6 10.7z'],
    fill: ['M12 8a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z'],
  },
  time: { stroke: [CIRCLE, 'M12 7.3V12l3.3 2.2'] },
  /* Two plates a side and a bar. The anchor's is angled; horizontal survives
     24px with the same read. */
  dumbbell: {
    stroke: ['M3.4 9.6v4.8', 'M6.6 7.4v9.2', 'M17.4 7.4v9.2', 'M20.6 9.6v4.8', 'M6.6 12h10.8'],
  },
  complete: { stroke: [CIRCLE, 'M8 12.2l2.8 2.8L16.2 9.6'] },
  /* Four marks converging on a centre: the anchor's substitution glyph. Unused
     while no step says "substitutions" — kept because the anchor defines it. */
  substitute: {
    stroke: [
      'M12 3.6v4.2', 'M12 16.2v4.2', 'M3.6 12h4.2', 'M16.2 12h4.2',
      'M6.6 6.6l2.2 2.2', 'M17.4 17.4l-2.2-2.2', 'M17.4 6.6l-2.2 2.2', 'M6.6 17.4l2.2-2.2',
    ],
  },

  /* Strip. Three overlapping crowns and a trunk — the anchor's tree is bushy,
     and one circle on a stick reads as a lollipop. */
  tree: {
    stroke: [
      'M12 21.2v-5.4',
      'M9.1 9.9a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z',
      'M14.9 9.9a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z',
      'M12 6a3.7 3.7 0 1 1 0 7.4A3.7 3.7 0 0 1 12 6z',
    ],
  },
  person: {
    stroke: ['M12 4.4a3.7 3.7 0 1 1 0 7.4 3.7 3.7 0 0 1 0-7.4z', 'M4.9 20.4a7.1 7.1 0 0 1 14.2 0'],
  },
  brain: {
    stroke: [
      'M12 4.4a3.9 3.9 0 0 0-3.8 3 3.4 3.4 0 0 0-1.7 6.1A3.6 3.6 0 0 0 9.9 20a3.3 3.3 0 0 0 2.1-.8z',
      'M12 4.4a3.9 3.9 0 0 1 3.8 3 3.4 3.4 0 0 1 1.7 6.1A3.6 3.6 0 0 1 14.1 20a3.3 3.3 0 0 1-2.1-.8z',
      'M12 4.4v14.8',
    ],
  },
  /* Rising bars under a rising arrow. Held for the moment Track Progress is
     CURRENT; the slot that will carry it says "Fits Your Time" today and takes
     the clock instead. */
  progress: {
    stroke: ['M4.6 20.4v-4.2', 'M9.4 20.4v-7', 'M14.2 20.4v-4', 'M4.2 12.4 9.4 7.2l3.4 3.4L19.6 4', 'M15.4 4h4.2v4.2'],
  },

  /* Lower row. Bag body, handle, and the small chevron the anchor draws inside. */
  equipment: {
    stroke: [
      'M4.7 8.5h14.6l-1 11.3a1.6 1.6 0 0 1-1.6 1.4H7.3a1.6 1.6 0 0 1-1.6-1.4z',
      'M9 8.5V6.7a3 3 0 0 1 6 0v1.8',
      'M10.3 12.4l1.7 1.7 1.7-1.7',
    ],
  },
  /* Concentric rings broken where the arrow enters, so the shaft reads as
     passing through rather than sitting on top. */
  goal: {
    stroke: [
      'M13.4 3.7a8.4 8.4 0 1 0 6.9 6.9',
      'M12.4 8.3a3.8 3.8 0 1 0 3.3 3.3',
      'M12 12l6.6-6.6',
      'M15.4 5.4h3.6V9',
    ],
  },
  trust: { stroke: ['M12 3l7.5 3v5.5c0 4.3-3 8.2-7.5 9.5-4.5-1.3-7.5-5.2-7.5-9.5V6z'] },

  /* Badge and CTAs. Filled, as the anchor draws them. */
  leaf: {
    fill: ['M20.2 3.8c.4 8.4-4 13.6-10.4 13.6-1.2 0-2.3-.2-3.2-.5C8.2 9.6 13 5.4 20.2 3.8z'],
    stroke: ['M5.4 20.6c1.2-3.4 3.4-6.5 6.4-9'],
  },
  chevron: { stroke: ['M9.5 5.5 16 12l-6.5 6.5'] },
  play: { fill: ['M8.5 5.4v13.2L19 12z'] },
};
