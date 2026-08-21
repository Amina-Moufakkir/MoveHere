/**
 * Open Air — the palette. Values only.
 *
 * Canonical plan: §15.
 *
 * Deliberately just colour. Spacing, type scale, radii, elevation, and motion
 * are **not** here, because those are where the two rendering models genuinely
 * disagree: `light-dark()` has no React Native equivalent, CSS layers two
 * shadows where RN takes one plus an elevation, and the web's rem scale and
 * RN's unitless points are not the same measurement. Colour values carried over
 * between clients unchanged; the structures around them did not. Sharing only
 * what actually transferred keeps this a fact rather than an abstraction.
 *
 * Each colour is a light/dark pair. The web expresses that as
 * `light-dark(light, dark)` in a CSS custom property; the native client
 * resolves it through useColorScheme(). Same values, two mechanisms.
 *
 * The web stylesheet remains the canonical *visual* reference — it is the
 * released client and its rendering is what the identity was tuned against.
 * This module is the canonical *source of the values*, and
 * `npm run check:palette` fails if the two disagree, so the duplication cannot
 * drift silently.
 *
 * Contrast, measured rather than guessed. These are binding on both clients:
 *   · white on blue #456da3 — 5.29:1, so the primary carries a label directly
 *   · white on blue-deep — 6.95:1; blue-ink on cloud — 7.94:1
 *   · white on green-deep #1a7846 — 5.50:1, the fill that carries text
 *   · green #1f8a52 — 4.36:1 with white, so it marks and fills but never sits
 *     behind small text
 *   · navy-faint — 3.9:1, large text and UI only; body copy uses navy-muted
 *
 * In dark mode the pairs invert rather than dim: green-deep becomes a light
 * green and `white` becomes a deep navy, so a filled surface still carries its
 * label at high contrast.
 */

export interface ColorPair {
  readonly light: string;
  readonly dark: string;
}

export const OPEN_AIR_PALETTE = {
  cloud: { light: '#f4f8fc', dark: '#0d1729' },
  cloudDeep: { light: '#e8eff8', dark: '#091120' },
  white: { light: '#ffffff', dark: '#16233c' },

  pale: { light: '#e3ebf6', dark: '#1d2c44' },
  paleGreen: { light: '#e1f5ea', dark: '#10301f' },

  navy: { light: '#111f3d', dark: '#eef4fb' },
  navyMuted: { light: '#4a5a78', dark: '#9fb0cc' },
  navyFaint: { light: '#6e7d98', dark: '#7d8ea9' },

  /* A greyed dusk-sky denim rather than a saturated signal blue, so the
     primary can carry a label without shouting. */
  blue: { light: '#456da3', dark: '#7fa3cf' },
  blueDeep: { light: '#345b8c', dark: '#9dbadd' },
  blueInk: { light: '#2c4e7a', dark: '#bcd0e8' },

  /* Deepened so confirmation stays unmistakable without out-shouting the
     primary. green marks; green-deep is the fill that carries text. */
  green: { light: '#1f8a52', dark: '#34c46f' },
  greenDeep: { light: '#1a7846', dark: '#5fd98d' },
  greenInk: { light: '#116634', dark: '#8fe6b0' },

  /* Held back for the substitute-session accent (§11). */
  yellow: { light: '#ffc240', dark: '#ffcb5c' },
  yellowInk: { light: '#8a5a00', dark: '#ffd985' },

  line: { light: '#dbe5f2', dark: '#22314f' },
  lineStrong: { light: '#bccce3', dark: '#33456a' },
  focus: { light: '#2c4e7a', dark: '#9dbadd' },
} as const satisfies Record<string, ColorPair>;

export type OpenAirColor = keyof typeof OPEN_AIR_PALETTE;

/** The CSS custom-property name a colour is published under on the web. */
export const cssVarName = (name: OpenAirColor): string =>
  `--color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** Resolves a pair for a rendered appearance. */
export const resolvePalette = (dark: boolean): Record<OpenAirColor, string> =>
  Object.fromEntries(
    Object.entries(OPEN_AIR_PALETTE).map(([k, v]) => [k, dark ? v.dark : v.light]),
  ) as Record<OpenAirColor, string>;
