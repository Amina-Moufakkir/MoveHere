/**
 * Feature pictograms, native.
 *
 * Geometry comes from shared source so both clients draw the same marks; this
 * component owns only how they are rendered through react-native-svg.
 */
import Svg, { Path } from 'react-native-svg';
import { glyphStroke } from '../theme/tokens';
import type { SessionGoal } from '../../src/domain/session.ts';
import {
  CHECK_PATH,
  CHECK_STROKE_WIDTH,
  CHECK_VIEWBOX,
  GLYPH_STROKE,
  GLYPH_VIEWBOX,
  glyphPathsFor,
  goalMarkFor,
} from '../../src/presentation/feature-glyphs.ts';

export function FeatureGlyph({
  id,
  size,
  color,
}: {
  readonly id: string;
  readonly size: number;
  readonly color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox={GLYPH_VIEWBOX}>
      {glyphPathsFor(id).map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={glyphStroke(size)}
          strokeLinecap={GLYPH_STROKE.linecap}
          strokeLinejoin={GLYPH_STROKE.linejoin}
        />
      ))}
    </Svg>
  );
}

/** The confirmation tick inside a selected tile's marker. */
export function CheckGlyph({ size, color }: { readonly size: number; readonly color: string }) {
  return (
    <Svg width={size} height={size} viewBox={CHECK_VIEWBOX}>
      <Path
        d={CHECK_PATH}
        fill="none"
        stroke={color}
        strokeWidth={CHECK_STROKE_WIDTH}
        strokeLinecap={GLYPH_STROKE.linecap}
        strokeLinejoin={GLYPH_STROKE.linejoin}
      />
    </Svg>
  );
}

/**
 * Session-goal mark.
 *
 * A separate subsystem from the environment glyphs — filled rather than
 * stroked, because these communicate a concept through mass. `surface` is the
 * colour the mark sits on, used to knock the pulse out of the heart, so the
 * pair reads at the same optical weight.
 */
export function GoalGlyph({
  goal,
  size,
  color,
  surface,
}: {
  readonly goal: SessionGoal;
  readonly size: number;
  readonly color: string;
  readonly surface: string;
}) {
  const mark = goalMarkFor(goal);
  return (
    <Svg width={size} height={size} viewBox={GLYPH_VIEWBOX}>
      {mark.fill.map((d) => (
        <Path key={d} d={d} fill={color} />
      ))}
      {(mark.knockout ?? []).map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={surface}
          strokeWidth={mark.knockoutWidth ?? 2}
          strokeLinecap={GLYPH_STROKE.linecap}
          strokeLinejoin={GLYPH_STROKE.linejoin}
        />
      ))}
    </Svg>
  );
}
