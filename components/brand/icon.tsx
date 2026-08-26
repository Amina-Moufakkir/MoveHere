import {
  GLYPH_STROKE,
  GLYPH_VIEWBOX,
  MARKETING_GLYPHS,
  type MarketingGlyph,
} from '@/src/presentation/feature-glyphs.ts';

/**
 * The marketing icon, web.
 *
 * One component, one geometry source, one stroke. Every inline `<svg>` on the
 * landing page goes through here: they had accumulated four stroke weights and
 * three optical sizes across four files, which made the set read as assembled
 * rather than drawn.
 *
 * Stroke and fill are both supported because the anchor uses both — a pin with
 * a hollow centre is a ring, and an outlined play triangle is not the mark the
 * anchor draws. Filled paths take `currentColor` too, so a caller still sets
 * one colour and gets a coherent mark.
 *
 * Size is a prop with a default rather than a caller's utility class, because
 * "same optical size" is the property that was being lost, and a default is
 * harder to lose than a convention.
 */
const SIZES = {
  xs: 'size-3.5',
  sm: 'size-5',
  md: 'size-7',
} as const;

export function Icon({
  name,
  className,
  size = 'md',
}: {
  readonly name: MarketingGlyph;
  readonly className?: string;
  /** `md` is the marketing default. `sm` for the trust line, `xs` for CTA marks. */
  readonly size?: keyof typeof SIZES;
}) {
  const glyph = MARKETING_GLYPHS[name];
  return (
    <svg
      viewBox={GLYPH_VIEWBOX}
      aria-hidden
      className={[SIZES[size], className].filter(Boolean).join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth={GLYPH_STROKE.width}
      strokeLinecap={GLYPH_STROKE.linecap}
      strokeLinejoin={GLYPH_STROKE.linejoin}
    >
      {glyph.stroke?.map((d) => (
        <path key={d} d={d} />
      ))}
      {glyph.fill?.map((d) => (
        <path key={d} d={d} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}
