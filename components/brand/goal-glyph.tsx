/**
 * Session-goal mark, web.
 *
 * A separate subsystem from the environment glyphs — filled rather than
 * stroked, because these communicate a concept through mass. `surface` is the
 * colour the mark sits on, used to knock the pulse out of the heart.
 */
import { GLYPH_STROKE, GLYPH_VIEWBOX, goalMarkFor } from '@/src/presentation/feature-glyphs.ts';
import type { SessionGoal } from '@/src/domain/session.ts';

export function GoalGlyph({
  goal,
  className,
  surfaceClassName,
}: {
  readonly goal: SessionGoal;
  readonly className?: string;
  /** Applied to the knockout so it can follow the surface it sits on. */
  readonly surfaceClassName?: string;
}) {
  const mark = goalMarkFor(goal);
  return (
    <svg viewBox={GLYPH_VIEWBOX} aria-hidden className={className}>
      {mark.fill.map((d) => (
        <path key={d} d={d} fill="currentColor" />
      ))}
      {(mark.knockout ?? []).map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          className={surfaceClassName}
          stroke="currentColor"
          strokeWidth={mark.knockoutWidth ?? 2}
          strokeLinecap={GLYPH_STROKE.linecap}
          strokeLinejoin={GLYPH_STROKE.linejoin}
        />
      ))}
    </svg>
  );
}
