import { GoalGlyph } from '@/components/brand/goal-glyph';
import type { SessionGoal } from '@/src/domain/session.ts';

/**
 * A preview of a real session.
 *
 * The blocks, movement names and doses shown here are produced by the actual
 * generator at build time and passed in — not written by hand. A marketing
 * mock of a workout would be the one place in this product where the session
 * on screen was not a session the product can produce, and it would be the
 * first thing to drift when programming policy changes.
 *
 * It is a still, not an interactive product. Nothing here is clickable, and
 * the call to action inside the frame is presentational — the real entry point
 * is the page's own CTA.
 *
 * **It depicts an example, never a returning user.** "Today's session" implies
 * an established personal context: an account, a history, something already
 * waiting. None of that exists — accounts are PLANNED and unbuilt (§22) — and a
 * landing page is precisely where that impression would form. The card names
 * itself an example, and carries its authority tier with it: project-created
 * programming, not professionally reviewed (§8).
 */
export interface PreviewBlock {
  readonly name: string;
  readonly items: readonly { readonly name: string; readonly dose: string }[];
}

export function SessionPreview({
  minutes,
  goal,
  goalLabel,
  blocks,
  compact = false,
}: {
  readonly minutes: number;
  readonly goal: SessionGoal;
  readonly goalLabel: string;
  readonly blocks: readonly PreviewBlock[];
  /** Hero use: a supporting object, not the subject. Tighter and quieter. */
  readonly compact?: boolean;
}) {
  return (
    <div
      /* Decorative as a whole: everything it says is said in prose elsewhere on
         the page, and reading a phone mock aloud item by item helps nobody. */
      aria-hidden
      className={`w-full rounded-[1.75rem] border border-line-strong bg-white shadow-raise ${compact ? "p-2" : "p-2.5"}`}
    >
      <div className={`rounded-[1.4rem] bg-cloud ${compact ? "px-3.5 py-4" : "px-4 py-5"}`}>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-extrabold text-navy">Example workout</p>
          <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
            {minutes} min
          </p>
        </div>

        <div className="mt-1 flex items-center gap-1.5">
          <GoalGlyph goal={goal} className="size-4 text-park-ink" surfaceClassName="text-cloud" />
          <p className="text-sm font-bold text-park-ink">{goalLabel}</p>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {blocks.map((block) => (
            <li key={block.name} className="rounded-lg border border-line bg-white px-3 py-2.5">
              <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
                {block.name}
              </p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {block.items.map((item) => (
                  <li key={item.name} className="flex flex-col">
                    {/* Wraps rather than truncates. A movement name cut to
                        "Standing hip hin…" is a worse preview than one that
                        takes a second line, and the names come from the real
                        catalog so their length is not ours to assume. */}
                    {/* Dose beneath the name rather than beside it. Side by
                        side, a long movement name and a long dose collide at
                        any width narrow enough for the card to stay subordinate. */}
                    <span className="text-[0.8125rem] font-bold leading-tight text-navy">
                      {item.name}
                    </span>
                    <span className="text-[0.6875rem] font-bold tabular-nums text-navy-muted">
                      {item.dose}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <p className="mt-4 flex h-11 items-center justify-center rounded-full bg-park text-sm font-extrabold text-cloud">
          Start Workout
        </p>

        {/* Inside the card so it cannot overflow the frame it describes. */}
        {compact && (
          <p className="mt-2.5 text-center text-[0.6875rem] font-bold text-navy-faint">
            project-created programming
          </p>
        )}
      </div>
    </div>
  );
}
