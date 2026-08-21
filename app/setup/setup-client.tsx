'use client';

import { ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import type { ReportedConditions } from '@/components/venue/venue-provider';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import { SESSION_DURATIONS } from '@/src/domain/session.ts';
import type { SessionGoal, SessionDuration } from '@/src/domain/session.ts';

const GOALS: readonly { value: SessionGoal; label: string; hint: string }[] = [
  { value: 'strength', label: 'Strength', hint: 'Fewer movements, more work each' },
  { value: 'conditioning', label: 'Conditioning', hint: 'Continuous work, shorter rests' },
];

const CONDITIONS: readonly { value: ReportedConditions; label: string; hint: string }[] = [
  { value: 'acceptable', label: 'Fine outside', hint: 'Good to train in the park' },
  { value: 'adverse', label: 'Bad out there', hint: 'Rain, ice, heat or dark' },
  { value: 'unknown', label: 'Not sure', hint: 'Treated the same as bad conditions' },
];

export function SetupClient() {
  const { inventory, loadOutcome, request, setRequest } = useVenue();

  const usable = (inventory?.features ?? []).filter((f) => f.usability.kind === 'usable');
  const venueBlind = request.conditions !== 'acceptable' || usable.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-12">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink">
            Step 3 of 3 · Set up
          </p>
          <h1 className="mt-2.5 text-page font-extrabold text-balance">How long have you got?</h1>

          {/* What was confirmed, carried forward so the choice has context. */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {loadOutcome?.kind === 'unusable' && (
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-navy-muted shadow-(--shadow-lift)">
                Saved park data couldn&rsquo;t be read — confirm again
              </span>
            )}
            {usable.length === 0 ? (
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-navy-muted shadow-(--shadow-lift)">
                No park confirmed — no-equipment session
              </span>
            ) : (
              usable.map((f) => (
                <span
                  key={f.featureId}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1.5 text-sm font-bold text-green-ink"
                >
                  <FeatureGlyph id={f.featureId} className="size-4" />
                  {findSupportedFeature(f.featureId)?.label ?? f.featureId}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-7 px-5 pb-6 pt-7 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          <fieldset>
            <legend className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-muted">
              Minutes
            </legend>
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {SESSION_DURATIONS.map((minutes: SessionDuration) => (
                <label
                  key={minutes}
                  className="relative flex cursor-pointer flex-col items-center gap-0.5 rounded-[--radius-xl] bg-white py-5 shadow-(--shadow-lift) transition-[transform,background-color,box-shadow] duration-(--duration-quick) ease-(--ease-spring) hover:-translate-y-0.5 active:scale-[0.98] has-checked:bg-blue has-checked:text-white has-checked:shadow-(--shadow-raise) has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus"
                >
                  <input
                    type="radio"
                    name="minutes"
                    value={minutes}
                    checked={request.minutes === minutes}
                    onChange={() => setRequest({ minutes })}
                    className="sr-only"
                  />
                  <span className="text-3xl font-extrabold tabular-nums leading-none tracking-[-0.04em] sm:text-4xl">
                    {minutes}
                  </span>
                  <span className="text-marker font-bold uppercase tracking-(--text-marker--letter-spacing) opacity-70">
                    min
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <fieldset>
            <legend className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-muted">
              Focus
            </legend>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {GOALS.map((goal) => (
                <label
                  key={goal.value}
                  className="relative flex cursor-pointer flex-col gap-1 rounded-[--radius-xl] bg-white p-4 shadow-(--shadow-lift) transition-[transform,background-color,box-shadow] duration-(--duration-quick) ease-(--ease-spring) hover:-translate-y-0.5 active:scale-[0.985] has-checked:bg-blue has-checked:text-white has-checked:shadow-(--shadow-raise) has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus"
                >
                  <input
                    type="radio"
                    name="goal"
                    value={goal.value}
                    checked={request.goal === goal.value}
                    onChange={() => setRequest({ goal: goal.value })}
                    className="sr-only"
                  />
                  <span className="text-lg font-extrabold leading-tight tracking-[-0.02em]">
                    {goal.label}
                  </span>
                  <span className="text-sm leading-snug opacity-75">{goal.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <fieldset>
            <legend className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-muted">
              Conditions outside
            </legend>
            <div className="mt-3 flex flex-col gap-2.5">
              {CONDITIONS.map((option) => (
                <label
                  key={option.value}
                  className="relative flex cursor-pointer items-center justify-between gap-3 rounded-[--radius-xl] bg-white px-4 py-3.5 shadow-(--shadow-lift) transition-colors duration-(--duration-quick) has-checked:bg-blue has-checked:text-white has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus"
                >
                  <input
                    type="radio"
                    name="conditions"
                    value={option.value}
                    checked={request.conditions === option.value}
                    onChange={() => setRequest({ conditions: option.value })}
                    className="sr-only"
                  />
                  <span>
                    <span className="block font-extrabold tracking-[-0.01em]">{option.label}</span>
                    <span className="mt-0.5 block text-sm leading-snug opacity-75">{option.hint}</span>
                  </span>
                  <span className="grid size-5 shrink-0 place-items-center rounded-full border-2 border-line-strong has-[:checked]:border-white" />
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="mt-auto border-t border-line bg-white/60 px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <p aria-live="polite" className="text-center text-sm font-semibold text-navy-muted">
            {venueBlind
              ? 'This will be a no-equipment session, not a park session'
              : `A park session using ${usable.length} confirmed ${usable.length === 1 ? 'feature' : 'features'}`}
          </p>
          <ActionLink href="/workout">Build the session</ActionLink>
        </div>
      </section>
    </div>
  );
}
