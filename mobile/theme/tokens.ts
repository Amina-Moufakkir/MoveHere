/**
 * Open Air on the device.
 *
 * Colour comes from shared source — src/design/palette.ts — because the values
 * carried over between clients unchanged. Everything below is native and stays
 * native, because the structures around those values did not carry:
 *
 *   · `light-dark()` has no React Native equivalent, so pairs resolve through
 *     useColorScheme() instead of the cascade;
 *   · CSS layers two shadows; RN takes one plus an Android elevation, so lift
 *     and raise are approximations rather than translations;
 *   · the web's rem scale and RN's unitless points are different measurements.
 *
 * Sharing only what actually transferred keeps this a record of a fact rather
 * than an abstraction invented to make the two look symmetrical.
 *
 * The measured contrast ratios live with the palette and are binding here.
 */
import { useColorScheme } from 'react-native';
import { resolvePalette } from '../../src/design/palette.ts';
import type { OpenAirColor } from '../../src/design/palette.ts';

export type ColorName = OpenAirColor;

export const radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;

/** Large type is rationed. These are the sizes /park spends it on. */
export const type = {
  marker: { fontSize: 12, letterSpacing: 0.96, fontWeight: '800' },
  page: { fontSize: 28, letterSpacing: -0.56, fontWeight: '800' },
  body: { fontSize: 16, lineHeight: 21 },
  tileLabel: { fontSize: 18, letterSpacing: -0.36, fontWeight: '800' },
  tileHint: { fontSize: 13, lineHeight: 17 },
  action: { fontSize: 16, fontWeight: '800' },
} as const;

/**
 * Touch targets.
 *
 * 44 is Apple's minimum; the tiles and the primary action are well above it
 * because this is used outdoors, one-handed, possibly mid-effort.
 */
export const touch = { min: 44, action: 56 } as const;

export interface Theme {
  readonly dark: boolean;
  readonly color: Record<ColorName, string>;
  readonly shadow: {
    readonly lift: object;
    readonly raise: object;
  };
}

export const useTheme = (): Theme => {
  const dark = useColorScheme() === 'dark';
  const color = resolvePalette(dark);

  // Elevation reads differently on a dark ground: the web's navy-tinted shadow
  // disappears against it, so opacity rises rather than the colour changing.
  const shadowColor = '#111f3d';
  return {
    dark,
    color,
    shadow: {
      lift: {
        shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: dark ? 0.34 : 0.08,
        shadowRadius: 8,
        elevation: 2,
      },
      raise: {
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: dark ? 0.44 : 0.14,
        shadowRadius: 18,
        elevation: 6,
      },
    },
  };
};
