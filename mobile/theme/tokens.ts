/**
 * Open Air, as far as one screen needs it.
 *
 * Deliberately native-local and deliberately incomplete. The web stylesheet
 * stays the canonical visual reference (§15); this is the second consumer
 * finding out which values actually carry over before anything is abstracted.
 * Only tokens /park uses are here. Resist adding the rest until a screen asks.
 *
 * Two things already differ from the web and are worth recording:
 *
 *   · `light-dark()` has no React Native equivalent, so every colour is a
 *     { light, dark } pair resolved through useColorScheme().
 *   · CSS can layer two shadows; RN takes one, plus an Android elevation. The
 *     lift and raise values below are approximations of the web's pairs, not
 *     translations of them.
 *
 * The measured contrast ratios from the web stylesheet carry over unchanged and
 * remain the rule for what may sit behind small text:
 *   · white on blue #456da3 — 5.29:1
 *   · white on green-deep #1a7846 — 5.50:1
 *   · navy-faint 3.9:1 — large text and UI only, never body copy
 *
 * In dark mode the selected-tile pair inverts rather than dims: green-deep
 * becomes a light green and `white` becomes deep navy, so the fill still
 * carries its label at high contrast.
 */
import { useColorScheme } from 'react-native';

interface Pair {
  readonly light: string;
  readonly dark: string;
}

const PALETTE = {
  cloud: { light: '#f4f8fc', dark: '#0d1729' },
  cloudDeep: { light: '#e8eff8', dark: '#091120' },
  white: { light: '#ffffff', dark: '#16233c' },
  pale: { light: '#e3ebf6', dark: '#1d2c44' },
  navy: { light: '#111f3d', dark: '#eef4fb' },
  navyMuted: { light: '#4a5a78', dark: '#9fb0cc' },
  navyFaint: { light: '#6e7d98', dark: '#7d8ea9' },
  blue: { light: '#456da3', dark: '#7fa3cf' },
  blueInk: { light: '#2c4e7a', dark: '#bcd0e8' },
  greenDeep: { light: '#1a7846', dark: '#5fd98d' },
  line: { light: '#dbe5f2', dark: '#22314f' },
  lineStrong: { light: '#bccce3', dark: '#33456a' },
} as const satisfies Record<string, Pair>;

export type ColorName = keyof typeof PALETTE;

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
  const color = Object.fromEntries(
    Object.entries(PALETTE).map(([k, v]) => [k, dark ? v.dark : v.light]),
  ) as Record<ColorName, string>;

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
