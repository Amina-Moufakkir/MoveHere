'use client';

import { useRouter } from 'next/navigation';
import { Action } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { GoalGlyph } from '@/components/brand/goal-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import type { ReportedConditions } from '@/src/programming/conditions.ts';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import { SESSION_DURATIONS } from '@/src/domain/session.ts';
import type { SessionGoal, SessionDuration } from '@/src/domain/session.ts';
import { PageHeading } from '@/components/shell/page-heading';
import { PageContainer } from '@/components/shell/page-container';
import { SelectableCard } from '@/components/ui/selectable-card';

/**
 * Three decisions, then a session.
 *
 * The heading used to be "How long have you got?", which named the first input
 * and left the other two to be discovered by scrolling. Time, goal and
 * conditions are all required, all authorised, and all the user's to make —
 * conditions in particular is a real generation input (§11) and is never
 * inferred, defaulted silently, or tucked behind a disclosure.
 *
 * **One visual language, not one widget.** Duration and goal are both "pick one
 * of a small set" and now share the same card surface. Conditions is not the
 * same interaction: each option carries a clarifying line — "Not sure" is
 * explicitly treated as bad conditions — and that sentence is the point of the
 * option rather than decoration. Compressed into a segmented pill it would be
 * lost, so conditions stays a list of rows and gets the surrounding surface
 * treatment instead. Coherence is the goal; identical controls are not.
 *
 * The form sits at a task measure inside the wider shell, left-aligned with the
 * heading. At the full 896px a two-option goal row becomes two 440px cards and
 * the condition rows strand their controls at the far right, which reads as a
 * layout stretched to fill space rather than one built for the task.
 */

const GOALS: readonly { value: SessionGoal; label: string; hint: string }[] = [
  { value: 'strength', label: 'Strength', hint: 'Fewer movements, more work each' },
  { value: 'conditioning', label: 'Conditioning', hint: 'Continuous work, shorter rests' },
];

const CONDITIONS: readonly { value: ReportedConditions; label: string; hint: string }[] = [
  { value: 'acceptable', label: 'Fine outside', hint: 'Good to train in the park' },
  { value: 'adverse', label: 'Bad out there', hint: 'Rain, ice, heat or dark' },
  { value: 'unknown', label: 'Not sure', hint: 'Treated the same as bad conditions' },
];

/** Section labels sit on the `<legend>`, which is what groups these controls. */
const legendClass = 'text-sm font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint';

export function SetupClient() {
  const router = useRouter();
  const { inventory, loadOutcome, request, setRequest, beginSession } = useVenue();

  const usable = (inventory?.features ?? []).filter((f) => f.usability.kind === 'usable');
  const venueBlind = request.conditions !== 'acceptable' || usable.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky pb-7 pt-8 sm:pb-9 sm:pt-12">
        <PageContainer measure="app-wide">
          <div className="max-w-3xl">
            <PageHeading
              eyebrow="Step 3 of 3"
              title="Set up your workout"
              lede={
                <>
                  Three choices: how long you have, what you want from it, and what it&rsquo;s like
                  outside.
                </>
              }
            />

            {/* Context, carried forward so the choices have something to sit
                against. Green because a confirmed feature is trusted
                environment state (§15) — it is not one of the three decisions,
                and it does not present as one. When nothing is confirmed this
                stays empty: the summary above the action already says what the
                session will be, and saying it twice would make the absence
                louder than the decisions. */}
            {(loadOutcome?.kind === 'unusable' || usable.length > 0) && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {loadOutcome?.kind === 'unusable' && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-navy-muted shadow-(--shadow-lift)">
                    Saved park data couldn&rsquo;t be read — confirm again
                  </span>
                )}
                {usable.map((f) => (
                  <span
                    key={f.featureId}
                    className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1.5 text-sm font-bold text-green-ink"
                  >
                    <FeatureGlyph id={f.featureId} className="size-5" />
                    {findSupportedFeature(f.featureId)?.label ?? f.featureId}
                  </span>
                ))}
              </div>
            )}
          </div>
        </PageContainer>
      </section>

      <section className="pb-6 pt-7">
        <PageContainer measure="app-wide">
          <div className="flex max-w-3xl flex-col gap-8">
            <fieldset>
              <legend className={legendClass}>Time</legend>
              <div className="mt-3 grid grid-cols-4 gap-2.5">
                {SESSION_DURATIONS.map((minutes: SessionDuration) => (
                  <SelectableCard
                    key={minutes}
                    type="radio"
                    name="minutes"
                    value={String(minutes)}
                    checked={request.minutes === minutes}
                    onChange={() => setRequest({ minutes })}
                    className="flex-col items-center gap-0.5 py-4"
                  >
                    <span className="text-4xl font-extrabold tabular-nums leading-none tracking-[-0.03em] sm:text-5xl">
                      {minutes}
                    </span>
                    <span className="text-marker font-bold uppercase tracking-(--text-marker--letter-spacing) opacity-70">
                      min
                    </span>
                  </SelectableCard>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendClass}>Goal</legend>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {GOALS.map((goal) => (
                  <SelectableCard
                    key={goal.value}
                    type="radio"
                    name="goal"
                    value={goal.value}
                    checked={request.goal === goal.value}
                    onChange={() => setRequest({ goal: goal.value })}
                    className="flex-col gap-1 p-5"
                  >
                    <GoalGlyph
                      goal={goal.value}
                      className="size-10 text-blue transition-colors duration-(--duration-quick) group-has-checked:text-white"
                      surfaceClassName="text-cloud group-has-checked:text-blue"
                    />
                    <span className="text-lg font-extrabold leading-tight tracking-[-0.02em]">
                      {goal.label}
                    </span>
                    <span className="text-sm leading-snug opacity-75">{goal.hint}</span>
                  </SelectableCard>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendClass}>Conditions</legend>
              {/* A bordered surface rather than a bare list, so the group reads
                  as a sibling of the two card grids above it. */}
              <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-cloud">
                {CONDITIONS.map((option, index) => (
                  <label
                    key={option.value}
                    className={[
                      'group relative flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-3.5',
                      'transition-colors duration-(--duration-quick) has-checked:bg-blue-wash has-checked:text-blue-ink',
                      'has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-focus',
                      index > 0 ? 'border-t border-line' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
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
                      <span className="mt-0.5 block text-sm leading-snug text-navy-muted group-has-checked:text-blue-ink/80">
                        {option.hint}
                      </span>
                    </span>
                    {/* A filled dot, not a colour change. The checked state is
                        carried by the input for assistive technology and by
                        this mark for anyone who cannot rely on the tint. */}
                    <span className="grid size-[22px] shrink-0 place-items-center rounded-full border-2 border-line-strong transition-colors duration-(--duration-quick) group-has-checked:border-blue">
                      <span className="size-[11px] rounded-full bg-blue opacity-0 transition-opacity duration-(--duration-quick) group-has-checked:opacity-100" />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </PageContainer>
      </section>

      <section className="mt-auto border-t border-line bg-cloud py-6">
        <PageContainer measure="app-wide">
          <div className="flex max-w-3xl flex-col gap-3">
            <p aria-live="polite" className="text-center text-sm font-semibold text-navy-muted">
              {venueBlind
                ? 'This will be a no-equipment session, not a park session'
                : `A park session using ${usable.length} confirmed ${usable.length === 1 ? 'feature' : 'features'}`}
            </p>
            <Action
              onClick={() => {
                /* The invariant lives in the provider, not here (§24.6). A
                   refusal means unfinished work exists, and F1's non-destructive
                   interim is to go to it rather than replace it — the approved
                   resume/discard choice is a later stage's work, and doing
                   nothing at all would leave the control looking broken. */
                beginSession();
                router.push('/workout');
              }}
            >
              Build my session
            </Action>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
