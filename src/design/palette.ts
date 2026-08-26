/**
 * Daylight — the MoveHere palette. Values only.
 *
 * Canonical plan: §15.
 *
 * One identity across both clients. The released Open Air appearance is
 * preserved at the `web-mvp-v1` tag; main evolves.
 *
 * The canvas is white. Not a tinted off-white — white, because a tinted ground
 * with white cards floating on it is what made the product read as
 * administrative software rather than something used outdoors. Depth now comes
 * from hairlines and from one saturated colour, not from elevation.
 *
 * Semantics, unchanged from Open Air and load-bearing:
 *   · blue  — the current choice or action. What you are doing now.
 *   · green — confirmed, trusted environment. What you told us is there.
 *   · yellow — substitute and detour only (§11). Never decoration.
 *
 * Candidate selection on /park stays blue: choosing is not yet trusting.
 * Confirmation on /confirm turns green, which is the moment trust is granted.
 *
 * `blueVivid` exists for one reason. Large text needs only 3:1, so the hero
 * numerals — prescriptions, the completion figure, future timers — can take the
 * most saturated blue in the system while `blue` stays safe for fills that
 * carry a label.
 *
 * Deliberately just colour. Spacing, type scale, radii, elevation and motion
 * are not here, because that is where the two rendering models genuinely
 * disagree.
 *
 * Contrast, measured rather than guessed. Binding on both clients:
 *   · ink on canvas — 18.7:1
 *   · inkMuted on canvas — 5.95:1; body copy never goes lighter
 *   · inkFaint — 3.8:1, large text and UI only
 *   · white on blue #1D5CF0 — 5.47:1, so the primary carries a label directly
 *   · white on greenDeep #0E7C50 — 5.23:1, the fill that carries text
 *   · blueVivid #2F6BFF on canvas — 4.5:1, ample at display size
 *   · greenInk on paleGreen — 5.8:1; yellowInk on canvas — 7.2:1
 *
 * In dark the pairs invert rather than dim: a filled surface becomes light and
 * takes near-black text, so every fill still carries its label — verified at
 * 6.9:1 on blue and 10.3:1 on green.
 */

export interface ColorPair {
  readonly light: string;
  readonly dark: string;
}

export const DAYLIGHT_PALETTE = {
  /* Ground and surfaces. The canvas is white; `pale` is a quiet inset, used
     for grouped rows and the workout media slot — never as the page itself. */
  cloud: { light: '#FFFFFF', dark: '#0B0F16' },
  cloudDeep: { light: '#F0F3F8', dark: '#070A0F' },
  white: { light: '#FFFFFF', dark: '#141A24' },

  pale: { light: '#F5F7FA', dark: '#1B2330' },
  paleGreen: { light: '#E4F5EC', dark: '#0E2A1D' },

  navy: { light: '#0B1220', dark: '#F5F7FA' },
  navyMuted: { light: '#5A6478', dark: '#9AA4B8' },
  navyFaint: { light: '#79839A', dark: '#7A8496' },

  /* A saturated athletic blue, not a greyed denim. It is the only colour doing
     real work: primary action, current choice, and — as blueVivid — the
     numerals a person reads at arm's length mid-effort. */
  blue: { light: '#1D5CF0', dark: '#5B9BFF' },
  blueDeep: { light: '#1748C4', dark: '#7FB2FF' },
  blueInk: { light: '#1D5CF0', dark: '#8FBBFF' },
  blueVivid: { light: '#2F6BFF', dark: '#6AA6FF' },
  blueWash: { light: '#EAF0FE', dark: '#16233A' },

  /* Confirmed, trusted environment. green marks; greenDeep is the fill that
     carries text; greenInk is text on a wash. */
  green: { light: '#12A566', dark: '#3FCB85' },
  greenDeep: { light: '#0E7C50', dark: '#45D68D' },
  greenInk: { light: '#0B6B44', dark: '#7EE3AF' },

  /* The park green, measured from the approved design anchor (§23.7).

     Separate from `green` on purpose. In the session flow green is a state —
     confirmed, trusted environment — and its meaning is load-bearing. On the
     marketing surface there is nothing to confirm, so green is free to be the
     brand instead. Reusing the state colour for brand would either drag the
     flow's semantics onto a landing page or drag a landing page's hue into the
     one place a colour means something.

     Measured, not chosen: hue 100°, saturation 38% — an olive, yellow-leaning
     park green, not the emerald family `green` belongs to.

     parkEdge is decorative only. At 2.29:1 it cannot define the boundary of a
     control (WCAG 1.4.11); parkEdgeStrong is the conformant substitute and is
     what interactive borders use (§23.7). */
  park: { light: '#4F7E38', dark: '#A6D183' },
  parkHover: { light: '#41682D', dark: '#B8DC99' },
  parkInk: { light: '#3D6329', dark: '#C3E3A6' },
  parkTint: { light: '#F2F4F1', dark: '#1A2118' },
  parkPanel: { light: '#F7F7F7', dark: '#141A24' },
  parkEdge: { light: '#9BB293', dark: '#3A4A34' },
  parkEdgeStrong: { light: '#7E9A75', dark: '#55694D' },

  /* Substitute and detour only (§11). */
  yellow: { light: '#FFB020', dark: '#FFC043' },
  yellowInk: { light: '#7A4E00', dark: '#FFD37A' },

  line: { light: '#E6EAF0', dark: '#232B38' },
  lineStrong: { light: '#CFD6E0', dark: '#35404F' },
  focus: { light: '#1D5CF0', dark: '#6AA6FF' },
} as const satisfies Record<string, ColorPair>;

export type DaylightColor = keyof typeof DAYLIGHT_PALETTE;

/** The CSS custom-property name a colour is published under on the web. */
export const cssVarName = (name: DaylightColor): string =>
  `--color-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;

/** Resolves a pair for a rendered appearance. */
export const resolvePalette = (dark: boolean): Record<DaylightColor, string> =>
  Object.fromEntries(
    Object.entries(DAYLIGHT_PALETTE).map(([k, v]) => [k, dark ? v.dark : v.light]),
  ) as Record<DaylightColor, string>;
