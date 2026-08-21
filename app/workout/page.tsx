import type { Metadata } from 'next';
import { ActionLink } from '@/components/ui/action';
import { ProjectContentNote } from '@/components/labels/project-content-note';

export const metadata: Metadata = { title: 'Your session' };

/** Placeholder data. No domain behaviour is wired in this milestone. */
const TOTAL = 5;
const INDEX = 3;
const CURRENT = {
  name: 'Bench step-up',
  sets: 4,
  reps: 10,
  perSide: true,
  source: 'Bench',
  cues: ['Whole foot on the bench', 'Drive through the top leg', 'Step down under control'],
};
const NEXT = 'Push-up';

export default function WorkoutPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Daylight behind the movement. The screen stays bright and open — this
          is somewhere you are, outdoors, not a console you are operating. */}
      <section className="open-sky flex flex-1 flex-col px-5 pb-8 pt-5 sm:px-8 sm:pt-7">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          {/* Progress: one segment per movement, filling as you go. */}
          <div
            role="progressbar"
            aria-valuenow={INDEX}
            aria-valuemin={0}
            aria-valuemax={TOTAL}
            aria-label="Movements completed"
            className="flex gap-1.5"
          >
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-(--duration-settle) ${
                  i < INDEX ? 'bg-green' : i === INDEX ? 'bg-blue' : 'bg-line-strong/60'
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-baseline justify-between text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing)">
            <span className="text-blue-ink">
              Movement {INDEX + 1} of {TOTAL}
            </span>
            <span className="text-navy-muted">30 min · Strength</span>
          </div>

          {/* The movement, given the room. */}
          <div className="flex flex-1 flex-col justify-center gap-6 py-8">
            <div className="flex flex-col gap-3">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-green-ink shadow-(--shadow-lift)">
                <span aria-hidden className="size-1.5 rounded-full bg-green" />
                Using the {CURRENT.source}
              </span>
              <h1 className="text-hero font-extrabold text-balance">{CURRENT.name}</h1>
            </div>

            {/* The prescription is the loudest thing on the screen. */}
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <p className="flex items-baseline gap-2.5 leading-none text-blue-ink">
                <span className="text-count font-extrabold tabular-nums">{CURRENT.sets}</span>
                <span className="text-3xl font-extrabold text-navy-faint sm:text-4xl">&times;</span>
                <span className="text-count font-extrabold tabular-nums">{CURRENT.reps}</span>
              </p>
              <p className="pb-2 text-marker font-extrabold uppercase leading-snug tracking-(--text-marker--letter-spacing) text-navy-muted">
                sets &times; reps
                {CURRENT.perSide && (
                  <>
                    <br />
                    per side
                  </>
                )}
              </p>
            </div>

            <ul className="flex flex-col gap-2 rounded-[--radius-xl] bg-white p-4 shadow-(--shadow-lift) sm:p-5">
              {CURRENT.cues.map((cue) => (
                <li key={cue} className="flex items-start gap-2.5 text-base leading-snug text-navy sm:text-lg">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" />
                  {cue}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-white px-5 pb-7 pt-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5">
          <ActionLink href="/complete">Done</ActionLink>
          <div className="flex items-baseline justify-between gap-4 text-sm font-semibold text-navy-muted">
            <span>Next — {NEXT}</span>
            <span className="tabular-nums">{TOTAL - INDEX - 1} to go</span>
          </div>
          <ProjectContentNote />
        </div>
      </section>
    </div>
  );
}
