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
