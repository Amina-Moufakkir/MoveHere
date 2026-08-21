import type { Metadata } from 'next';
import { ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';

export const metadata: Metadata = { title: 'What is in the park' };

/** Placeholder data. No domain behaviour is wired in this milestone. */
const FEATURES = [
  { id: 'park-bench', label: 'Bench', hint: 'Sit or step on it' },
  { id: 'pull-up-bar', label: 'Pull-up bar', hint: 'Built to hang from' },
  { id: 'parallel-bars', label: 'Parallel bars', hint: 'Dip or support bars' },
  { id: 'stairs', label: 'Stairs', hint: 'Steps you can use' },
  { id: 'hill', label: 'Hill', hint: 'A slope to climb' },
  { id: 'walking-running-path', label: 'Path', hint: 'To walk or run on' },
  { id: 'running-track', label: 'Track', hint: 'A marked loop' },
  { id: 'hard-court', label: 'Court', hint: 'Basketball or tennis' },
];

export default function ParkPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* A shallow band of daylight, not a hero. Page headings stay modest so
          large type stays reserved for the workout itself. */}
      <section className="open-sky px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-12">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink">
            Step 1 of 4
          </p>
          <h1 className="mt-2.5 text-page font-extrabold text-balance">What&rsquo;s in your park?</h1>
          <p className="mt-2.5 max-w-md text-base leading-snug text-navy-muted text-pretty">
            Tap everything you can see and use. Skip anything you&rsquo;re unsure about.
          </p>
        </div>
      </section>

      {/* Two-column grid of tactile tiles. The icon leads; the label supports. */}
      <section className="px-5 pb-6 pt-6 sm:px-8">
        <fieldset className="mx-auto w-full max-w-2xl">
          <legend className="sr-only">Park features</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {FEATURES.map((feature) => (
              <label
                key={feature.id}
                className="group relative flex h-full cursor-pointer select-none flex-col gap-3 rounded-[--radius-xl] bg-white p-4 shadow-(--shadow-lift) transition-[transform,background-color,box-shadow] duration-(--duration-quick) ease-(--ease-spring) hover:-translate-y-0.5 hover:shadow-(--shadow-raise) active:translate-y-0 active:scale-[0.985] has-checked:-translate-y-0.5 has-checked:bg-green-deep has-checked:shadow-(--shadow-raise) has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus sm:p-5"
              >
                <input type="checkbox" name="feature" value={feature.id} className="sr-only" />

                <span className="flex items-start justify-between gap-2">
                  <span className="grid size-14 place-items-center rounded-[--radius-lg] bg-pale transition-colors duration-(--duration-quick) group-has-checked:bg-white/20 sm:size-16">
                    <FeatureGlyph
                      id={feature.id}
                      className="size-8 text-blue-ink transition-colors duration-(--duration-quick) group-has-checked:text-white sm:size-9"
                    />
                  </span>

                  {/* Shape changes as well as colour: empty ring becomes a filled tick. */}
                  <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border-2 border-line-strong transition-colors duration-(--duration-quick) group-has-checked:border-white group-has-checked:bg-white">
                    <svg viewBox="0 0 20 20" aria-hidden className="size-4 opacity-0 transition-opacity duration-(--duration-quick) group-has-checked:opacity-100">
                      <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" className="text-green-deep" />
                    </svg>
                  </span>
                </span>

                <span className="mt-auto">
                  <span className="block text-lg font-extrabold leading-tight tracking-[-0.02em] text-navy transition-colors duration-(--duration-quick) group-has-checked:text-white">
                    {feature.label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-navy-muted transition-colors duration-(--duration-quick) group-has-checked:text-white/85">
                    {feature.hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="mt-auto border-t border-line bg-white/60 px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <ActionLink href="/confirm">Continue</ActionLink>
          <p className="text-center text-sm leading-snug text-navy-muted">
            Stays on your phone. Your session only uses what you mark here.
          </p>
        </div>
      </section>
    </div>
  );
}
