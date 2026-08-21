/**
 * Feature pictograms, web.
 *
 * Geometry comes from shared source so both clients draw the same marks; this
 * component owns only how they are rendered in the DOM.
 */
import { GLYPH_STROKE, GLYPH_VIEWBOX, glyphPathsFor } from '@/src/presentation/feature-glyphs.ts';

export function FeatureGlyph({ id, className }: { readonly id: string; readonly className?: string }) {
  return (
    <svg
      viewBox={GLYPH_VIEWBOX}
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={GLYPH_STROKE.width}
      strokeLinecap={GLYPH_STROKE.linecap}
      strokeLinejoin={GLYPH_STROKE.linejoin}
    >
      {glyphPathsFor(id).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
