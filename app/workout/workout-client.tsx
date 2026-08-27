'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Action } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { ProjectContentNote } from '@/components/labels/project-content-note';
import { useVenue } from '@/components/venue/venue-provider';
import { exerciseById, exerciseCues, exerciseName } from '@/src/programming/session-builder.ts';
import { EMPTY_EXECUTION, currentIndex } from '@/src/domain/execution.ts';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import { resolveInstructions } from '@/src/domain/instruction-resolution.ts';
import {
  CUES_HEADING,
  INSTRUCTION_HEADING,
  instructionPanel,
} from '@/src/presentation/instruction-copy.ts';
import { SUBSTITUTE_LABEL, SUBSTITUTE_REASON } from '@/src/presentation/session-copy.ts';
import { doseText, prescriptionDisplay } from '@/src/presentation/prescription-copy.ts';
import { EmptyState } from '@/components/shell/empty-state';
import { PageContainer } from '@/components/shell/page-container';
import { exerciseVisualFor } from './exercise-visuals';

/**
 * The workout screen.
 *
 * **The movement is one card.** Everything that is the current exercise —
 * name, dose, where it is performed, what it looks like, how to do it, what to
 * remember — sits inside a single bordered surface, and everything outside that
 * surface is either session context above or the controls below. The screen
 * previously ran as a flat column where the action area read as a footer
 * competing with the content it followed.
 *
 * **Identify, recognise, then read.** Name and dose say what this is; the
 * picture lets someone match it to the movement they know; the written
 * instruction is what they follow. The picture sits before the instructions on
 * web for that reason — a decision about presentation, not about authority.
 * Native's order is unchanged and so is every rule governing what may be shown.
 *
 * The measure stays at the reading width rather than widening with the extra
 * content. Instruction steps are prose, and prose set to 900px runs past 110
 * characters a line.
 */

/**
 * Whether the rendered appearance is dark, for media selection only.
 *
 * Everything else on this page gets its colours from `light-dark()` and needs
 * no JavaScript. An image cannot be chosen by CSS without shipping both, so
 * this reads the same two inputs the stylesheet uses: an explicit `data-theme`
 * when one is set, the system preference otherwise.
 *
 * It starts false on both the prerender and the first client render, then
 * corrects in an effect. A dark-mode reader sees the light composition for one
 * frame; the alternative is a hydration mismatch on every dark-mode load.
 */
function useDarkAppearance(): boolean {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const read = () => {
      const explicit = document.documentElement.getAttribute('data-theme');
      setDark(explicit === 'dark' || (explicit !== 'light' && query.matches));
    };
    read();
    query.addEventListener('change', read);
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      query.removeEventListener('change', read);
      observer.disconnect();
    };
  }, []);

  return dark;
}

export function WorkoutClient() {
  const router = useRouter();
  const { session, workout, markDone, finishSession } = useVenue();
  const dark = useDarkAppearance();

  const items = useMemo(
    () =>
      workout !== null && workout.kind !== 'not-generated'
        ? workout.blocks.flatMap((b) => b.items.map((item) => ({ block: b.name, item })))
        : [],
    [workout],
  );

  const total = items.length;
  /* Position is the resolved prefix length, not a count of completions — the
     two were the same number only while every advance was a Done (§25.3). */
  const execution = session?.execution ?? EMPTY_EXECUTION;
  const done = Math.min(currentIndex(execution), total);
  const current = items[Math.min(done, Math.max(total - 1, 0))];

  /* Movement changes are announced, and only the movement change. The heading
     does not announce itself, and a progressbar's value is read on focus rather
     than spoken on every update, so this is the one live region on the page.
     Empty on first render so arriving at the screen is silent — an announcement
     on load would describe something the reader had not yet done. */
  const [announcement, setAnnouncement] = useState('');
  const settled = useRef(false);
  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }
    if (current === undefined || total === 0) return;
    setAnnouncement(
      `Movement ${Math.min(done + 1, total)} of ${total}: ${exerciseName(current.item.exerciseId)}`,
    );
  }, [done, total, current]);

  if (session === null || workout === null) {
    return (
      <PageContainer className="flex flex-1 flex-col">
        <EmptyState
          title="No session yet"
          body="Choose how long you have and MoveHere will build one."
          actionHref="/setup"
          actionLabel="Set up a session"
        />
      </PageContainer>
    );
  }

  if (workout.kind === 'not-generated') {
    return (
      <PageContainer className="flex flex-1 flex-col">
        <EmptyState
          title="Couldn&rsquo;t build a session"
          body={
            workout.reason === 'insufficient-time'
              ? 'There isn’t enough time for a full session at this length.'
              : 'No movements are available. This is a content problem, not something you did.'
          }
          actionHref="/setup"
          actionLabel="Change the session"
        />
      </PageContainer>
    );
  }

  const isSubstitute = workout.kind === 'substitute-session';
  const finished = done >= total;

  const advance = () => {
    if (done + 1 >= total) {
      markDone();
      /* One lifecycle operation, not two writes composed here. The provider
         appends the immutable record and then clears the session (§24.6). */
      const now = new Date();
      const localDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-');
      finishSession(now.toISOString(), localDate);
      router.push('/complete');
      return;
    }
    markDone();
  };

  const dose = current === undefined ? null : prescriptionDisplay(current.item.prescription);
  const basis = current?.item.basis;
  const featureId = basis?.kind === 'confirmed-feature' ? basis.featureId : null;
  const featureLabel =
    featureId === null ? null : (findSupportedFeature(featureId)?.label ?? String(featureId));

  /* Instructions come from the shared pipeline, resolved against the basis this
     item actually cited — the same call native makes. `hidden` covers both
     outstanding and not-required, and the two are deliberately
     indistinguishable here: the distinction belongs in the content records, and
     on screen it would be an announcement about the project's completeness made
     to someone mid-workout who did not ask (§8). Neither renders a heading, an
     affordance, or a note explaining an absence. */
  const exercise = current === undefined ? null : exerciseById(current.item.exerciseId);
  const instructions =
    exercise === null || basis === undefined
      ? { kind: 'hidden' as const }
      : instructionPanel(resolveInstructions(exercise, basis));

  /* Null for most of the catalog, and null renders nothing at all — no
     placeholder, no empty frame, no disabled control. */
  const visual =
    current === undefined
      ? null
      : exerciseVisualFor(
          current.item.exerciseId,
          featureId,
          isSubstitute ? 'substitute' : 'park',
          dark,
        );

  const cues = current === undefined ? [] : exerciseCues(current.item.exerciseId);

  return (
    <div className="flex flex-1 flex-col">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <section className="open-sky flex flex-1 flex-col pb-8 pt-5 sm:pt-7">
        <PageContainer className="flex flex-1 flex-col">
          <div
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Movements resolved"
            className="flex gap-1.5"
          >
            {items.map((entry, i) => (
              <span
                key={`${entry.item.exerciseId}-${i}`}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-(--duration-settle) ${
                  /* Resolved segments are neutral, not green. Green asserted
                     "completed" for every position behind the cursor, which stops
                     being true once a movement can be skipped — and E1 has no
                     visual language for that difference yet. Showing a movement is
                     behind you without claiming which kind is the truthful
                     simplification; E2 gives skipped its own treatment. */
                  i < done ? 'bg-line-strong' : i === done ? 'bg-blue' : 'bg-line-strong/40'
                }`}
              />
            ))}
          </div>

          <div className="mt-3 flex items-baseline justify-between gap-3 text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing)">
            <span className="text-blue-ink">
              Movement {Math.min(done + 1, total)} of {total}
            </span>
            <span className="text-navy-muted">
              {session.minutes} min · {session.goal}
            </span>
          </div>

          {/* A substitute is never dressed up as a park session (§11). */}
          {isSubstitute && (
            <div className="mt-4 rounded-xl border-l-4 border-yellow bg-pale px-4 py-3">
              <p className="text-sm font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-yellow-ink">
                {SUBSTITUTE_LABEL}
              </p>
              <p className="mt-1 text-sm leading-snug text-navy-muted">
                {SUBSTITUTE_REASON[workout.reason.kind]}
              </p>
            </div>
          )}

          {current !== undefined && (
            <article className="mt-5 overflow-hidden rounded-2xl border border-line bg-white shadow-(--shadow-lift)">
              <div className="px-5 pt-6 sm:px-7">
                <h1 className="text-page font-extrabold text-balance">
                  {exerciseName(current.item.exerciseId)}
                </h1>

                {/* Strong product information, not a headline. The numerals were
                    set larger than the movement name, which made the dose the
                    loudest thing on a screen about an exercise. */}
                {dose !== null && (
                  <div className="mt-2" aria-label={doseText(current.item.prescription)}>
                    <p className="flex items-baseline leading-none text-blue-vivid">
                      {dose.kind === 'pair' ? (
                        <>
                          <span className="text-3xl font-extrabold tabular-nums">{dose.first.value}</span>
                          <span className="ml-1 text-lg font-extrabold">{dose.first.unit}</span>
                          <span className="mx-1.5 text-lg font-extrabold text-navy-faint">&times;</span>
                          <span className="text-3xl font-extrabold tabular-nums">{dose.second.value}</span>
                          <span className="ml-1 text-lg font-extrabold">{dose.second.unit}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-extrabold tabular-nums">{dose.value}</span>
                          <span className="ml-1 text-lg font-extrabold">{dose.unit}</span>
                        </>
                      )}
                    </p>

                    {dose.support.length > 0 && (
                      <p className="mt-1 text-base font-extrabold text-navy-muted">
                        {dose.support.join(' · ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Context, not content. Feature provenance preserved exactly;
                    only its weight changed. */}
                <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-bold text-navy-muted">
                  <span>{current.block}</span>
                  <span aria-hidden className="text-navy-faint">
                    ·
                  </span>
                  {featureId === null ? (
                    <span className="text-blue-ink">No equipment</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-green-ink">
                      <FeatureGlyph id={featureId} className="size-4" />
                      Using the {featureLabel}
                    </span>
                  )}
                </p>
              </div>

              {/* Recognition support, before the instruction it illustrates.
                  Absent media collapses the band entirely — no placeholder, no
                  empty region, no reserved height. */}
              {visual !== null && (
                <figure className="mt-5 border-y border-line bg-pale">
                  <Image
                    src={visual.source}
                    alt={visual.alt}
                    sizes="(min-width: 680px) 42rem, 100vw"
                    className="h-auto w-full"
                  />
                </figure>
              )}

              <div className={`px-5 pb-6 sm:px-7 ${visual !== null ? 'pt-6' : 'pt-7'}`}>
                {instructions.kind === 'available' && (
                  <section>
                    <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
                      {INSTRUCTION_HEADING}
                    </h2>
                    {/* The whole authored sequence, in order, never truncated to
                        fit a fold. A half-instruction is worse than none. */}
                    <ol className="mt-3 flex flex-col gap-3">
                      {instructions.steps.map((step, i) => (
                        <li key={step} className="flex items-start gap-3">
                          <span
                            aria-hidden
                            className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-wash text-sm font-extrabold tabular-nums text-blue-ink"
                          >
                            {i + 1}
                          </span>
                          <span className="text-base leading-snug text-navy sm:text-lg">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {cues.length > 0 && (
                  <section className={instructions.kind === 'available' ? 'mt-7' : ''}>
                    <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
                      {CUES_HEADING}
                    </h2>
                    <ul className="mt-2 flex flex-col border-t border-line">
                      {cues.map((cue) => (
                        <li
                          key={cue}
                          className="flex items-start gap-2.5 border-b border-line py-3 text-base leading-snug sm:text-lg"
                        >
                          <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" />
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            </article>
          )}

          {/* In normal document flow, after the card. No bar, no border, no
              sticky surface: an action area styled as a footer competed with
              the movement it followed and made a scrollable card look
              truncated. Nothing here overlays content at any width, so the
              whole movement is readable before the control becomes dominant. */}
          <div className="mt-6 flex flex-col gap-3.5 pb-2">
            <Action onClick={advance}>{done + 1 >= total ? 'Finish session' : 'Done'}</Action>

          <div className="flex items-baseline justify-between gap-4 text-sm font-semibold text-navy-muted">
            <span>
              {done + 1 < total
                ? `Next — ${exerciseName(items[done + 1]!.item.exerciseId)}`
                : 'Last movement'}
            </span>
            <span className="tabular-nums">{Math.max(total - done - 1, 0)} to go</span>
          </div>

          {/* No generation control here. It sat inside the session it destroyed,
              was shown only while that session was unfinished, and carried no
              warning — a silent replacement path that contradicts the
              one-active-session invariant. Building a different session is a
              preparation decision (§24.6). */}
          <ProjectContentNote />
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
