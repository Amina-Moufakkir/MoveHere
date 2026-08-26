import {
  GLYPH_STROKE,
  GLYPH_VIEWBOX,
  MARKETING_GLYPH_PATHS,
  type MarketingGlyph,
} from '@/src/presentation/feature-glyphs.ts';

/**
 * The marketing icon, web.
 *
 * One component, one geometry source, one stroke. Every inline `<svg>` on the
 * landing page went through here instead: they had accumulated four stroke
 * weights and three optical sizes across four files, which is what made the set
 * read as assembled rather than drawn.
 *
 * Size is a prop with a default rather than a caller's utility class, because
 * "same optical size" is the property that was being lost, and a default is
 * harder to lose than a convention. Colour still comes from `currentColor` —
 * that one genuinely is the caller's business.
 */
export function Icon({
  name,
  className,
  size = 'md',
}: {
  readonly name: MarketingGlyph;
  readonly className?: string;
  /** `md` is the marketing default; `sm` is for inline chips. */
  readonly size?: 'sm' | 'md';
}) {
  return (
    <svg
      viewBox={GLYPH_VIEWBOX}
      aria-hidden
      className={[size === 'sm' ? 'size-4' : 'size-7', className].filter(Boolean).join(' ')}
      fill="none"
      stroke="currentColor"
      strokeWidth={GLYPH_STROKE.width}
      strokeLinecap={GLYPH_STROKE.linecap}
      strokeLinejoin={GLYPH_STROKE.linejoin}
    >
      {MARKETING_GLYPH_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
