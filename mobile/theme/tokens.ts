/**
 * Daylight on the device.
 *
 * Colour comes from shared source — src/design/palette.ts — because the values
 * carried over between clients unchanged. Everything below is native and stays
 * native, because the structures around those values did not:
 *
 *   · `light-dark()` has no React Native equivalent, so pairs resolve through
 *     useColorScheme() instead of the cascade;
 *   · the web's rem scale and RN's unitless points are different measurements;
 *   · elevation barely exists here now, by design — see `shadow` below.
 *
 * The measured contrast ratios live with the palette and are binding here.
 */
import { useColorScheme } from 'react-native';
import { resolvePalette } from '../../src/design/palette.ts';
import type { DaylightColor } from '../../src/design/palette.ts';

export type ColorName = DaylightColor;

/**
 * Type is size and weight. Nothing else.
 *
 * `display` is reserved for movement-critical information — a prescription, a
 * completion figure, a future timer. It is never spent on a heading and never
 * on marketing. That reservation is what makes the number the event on screen
 * rather than one loud thing among several.
 *
 * 64 rather than 88. Large enough to read at arm's length mid-effort, small
 * enough that the number sits inside a composition instead of becoming it —
 * which is the balance the reference strikes and 88 did not.
 *
 * `micro` is the tracked small-cap marker. It is rationed to one use per
 * screen: repeated six times it stops reading as a marker and starts reading as
 * an analytics dashboard, which is precisely the look this replaces.
 */
export const type = {
  display: { fontSize: 64, lineHeight: 64, fontWeight: '800', letterSpacing: -2.6 },
  displayUnit: { fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.8 },
  displaySm: { fontSize: 44, lineHeight: 46, fontWeight: '800', letterSpacing: -1.3 },
  title: { fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 20, lineHeight: 26, fontWeight: '800', letterSpacing: -0.2 },
  lead: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 17, fontWeight: '700' },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 0.88 },
  action: { fontSize: 16, lineHeight: 20, fontWeight: '800' },
} as const;

/**
 * Vertical space has to represent hierarchy.
 *
 * Where it merely represents unused space it is a defect rather than breathing
 * room — the workout player was about two-fifths empty before the media slot
 * took that region back.
 */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

/** The screen edge. Content sits on the canvas now, so it can come out. */
export const gutter = 20;

export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

/**
 * Touch targets. 44 is Apple's minimum; the primary action is well above it
 * because this is used outdoors, one-handed, possibly mid-effort.
 */
export const touch = { min: 44, action: 56 } as const;

/** Glyph sizes. Stroke thickens above 40 so enlarged marks do not go spindly. */
export const glyph = { chip: 20, row: 40, tile: 64, context: 120 } as const;
export const glyphStroke = (size: number): number => (size >= 40 ? 2.25 : 1.75);

/** Motion. Four moments, and every one respects reduced motion. */
export const motion = {
  press: 120,
  fill: 140,
  progress: 240,
  countUp: 520,
} as const;

export interface Theme {
  readonly dark: boolean;
  readonly color: Record<ColorName, string>;
  /**
   * Elevation is almost gone.
   *
   * Depth comes from hairlines and from one saturated colour. `lift` survives
   * for the primary action alone, where a hairline would read as an outline
   * button rather than the thing you press.
   */
  readonly shadow: { readonly lift: object };
}

export const useTheme = (): Theme => {
  const dark = useColorScheme() === 'dark';
  const color = resolvePalette(dark);
  return {
    dark,
    color,
    shadow: {
      lift: {
        shadowColor: '#0B1220',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: dark ? 0.5 : 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    },
  };
};
