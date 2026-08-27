'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Action } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { ProjectContentNote } from '@/components/labels/project-content-note';
import { useVenue } from '@/components/venue/venue-provider';
import { activityStore } from '@/lib/activity-store';
import type { ActivityRecord } from '@/lib/activity-store';
import { byPresentation } from '@/src/presentation/feature-copy.ts';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import { SUBSTITUTE_LABEL, SUBSTITUTE_REASON } from '@/src/presentation/session-copy.ts';
import { HISTORY_VS_CORRECTION } from '@/src/presentation/recap-copy.ts';
import { selectRecap } from '@/src/domain/recap-selection.ts';
import { WorkoutTimeline } from '@/components/recap/workout-timeline';
import { ActivityStrip } from '@/components/recap/activity-strip';
import { EmptyState } from '@/components/shell/empty-state';
import { PageContainer } from '@/components/shell/page-container';

/**
 * The recap: the workout that was completed, as it was programmed.
 *
 * **Rendered entirely from the immutable Activity record.** No generator call,
 * no read of current inventory, no substitution of today's policy for the
 * prescriptions that were given (§24.3). Before the record stored movements,
 * this screen could only show four metadata facts and lost the workout itself —
 * it was not under-designed, it was under-fed.
 *
 * **What is shown is what was programmed, never what was achieved.** The screen
 * once led with "30" at display size above the word "minutes", which reads as
 * thirty minutes of training. MoveHere records no elapsed time; it records that
 * a session with a thirty-minute prescription was marked done (§24.11). So the
 * facts stay small and labelled, and the workout is the main event.
 *
 * Three layers. **A** acknowledges, quietly and without celebration. **B** is
 * the record — every movement, in order, with what was prescribed. **C** asks
 * only *have I been training recently*, and answers it with marks on a calendar
 * and a count of sessions. It is not analytics and it does not become analytics
 * by growing: no streaks, no trends, no minutes aggregated (§24.10, §24.11).
 *
 * A specific record can be reopened with `?r=<recordId>`. A query parameter
 * rather than a route segment, because these records exist only on the device
 * and a static export cannot prerender a page per record (§24.6).
 */

const factLabel =
  'text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint';

export function CompleteClient() {
  const router = useRouter();
  const { inventory, correct, endSession } = useVenue();
  const [corrected, setCorrected] = useState<ReadonlySet<SupportedFeatureId>>(new Set());
  /* Announces a correction that removed the control the user was operating.
     Without it the row simply changes and a screen-reader user is told
     nothing. */
  const [announcement, setAnnouncement] = useState('');
  /* Marking a feature removes the button that was just pressed, which dropped
     keyboard focus to <body> — a keyboard user had to tab from the top of the
     page to reach the next row. Focus moves to the status the correction
     produced instead, which is both where they were and what changed. */
  const [lastCorrected, setLastCorrected] = useState<SupportedFeatureId | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (lastCorrected === null) return;
    const status = listRef.current?.querySelector<HTMLElement>(
      `[data-corrected-status="${lastCorrected}"]`,
    );
    status?.focus();
  }, [lastCorrected]);

  /* Read after mount, because records live on the device and the page is
     prerendered. `loaded` distinguishes "not read yet" from "nothing to show",
     so no empty state flashes before history arrives. */
  const requestedId = useSearchParams().get('r');
  const [selection, setSelection] = useState<ReturnType<typeof selectRecap> | null>(null);
  const [activityDates, setActivityDates] = useState<readonly string[]>([]);
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    const records = activityStore().list();
    setSelection(selectRecap(records, requestedId));
    setActivityDates(records.map((r) => r.localDate));
    /* Today's local date decides only which week is current. Stored dates are
       never reinterpreted through it (§24.9). */
    const now = new Date();
    setToday(
      [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-'),
    );
  }, [requestedId]);

  const loaded = selection !== null;
  const record = selection?.kind === 'record' ? selection.record : null;

  const featuresUsed = (record?.featuresUsed ?? []) as readonly SupportedFeatureId[];
  const movements = record?.movements.length ?? 0;

  const confirmed = [...(inventory?.features ?? [])].sort((a, b) =>
    byPresentation(a.featureId, b.featureId),
  );

  const isSubstitute = record?.kind === 'substitute-session';

  /* Nothing renders until history has been read. Rendering the summary with no
     record would show "0 min" for a frame; rendering an empty state would claim
     nothing was finished before we had looked. */
  if (!loaded || selection === null || today === null) return null;

  /* A requested record that cannot be read is its own state, with its own
     words. Falling back to the newest would answer a question about one
     workout with a different workout — every fact on screen true, and the
     screen as a whole a lie about which session it describes. */
  if (selection.kind === 'requested-unavailable') {
    return (
      <PageContainer className="flex flex-1 flex-col">
        <EmptyState
          title="That workout isn&rsquo;t available"
          body="It may have been deleted, or its record could not be read. Nothing else has been changed."
          actionHref="/complete"
          actionLabel="See the latest workout"
        />
      </PageContainer>
    );
  }

  if (selection.kind === 'no-records' || record === null) {
    return (
      <PageContainer className="flex flex-1 flex-col">
        <EmptyState
          title="Nothing finished yet"
          body="Complete a session and this is where it lands."
          actionHref="/setup"
          actionLabel="Set up a session"
        />
      </PageContainer>
    );
  }

  /** Corrections go through applyCorrection. Nothing here touches inventory. */
  const mark = (featureId: SupportedFeatureId, kind: 'feature-unusable' | 'feature-absent') => {
    correct({ kind, featureId, occurredAt: new Date().toISOString() });
    setCorrected((prev) => new Set(prev).add(featureId));
    const label = findSupportedFeature(featureId)?.label ?? featureId;
    setAnnouncement(`${label} marked not usable. Left out of sessions.`);
    setLastCorrected(featureId);
  };

  return (
    <div className="flex flex-1 flex-col">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* Acknowledge first. The correction ask comes after, not instead. */}
      <section className="open-sky pb-9 pt-12 sm:pt-16">
        <PageContainer measure="app-wide">
          <div className="max-w-3xl">
            <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-green-ink">
              Session complete
            </p>
            <h1 className="mt-2 text-page font-extrabold text-balance">You moved here.</h1>

            <dl className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className={factLabel}>Programmed duration</dt>
                <dd className="mt-1 text-2xl font-extrabold tabular-nums text-navy">
                  {record.requestedMinutes} min
                </dd>
              </div>

              <div>
                <dt className={factLabel}>Goal</dt>
                <dd className="mt-1 text-2xl font-extrabold capitalize text-navy">{record.goal}</dd>
              </div>

              {movements > 0 && (
                <div>
                  <dt className={factLabel}>Movements programmed</dt>
                  <dd className="mt-1 text-2xl font-extrabold tabular-nums text-navy">
                    {movements}
                  </dd>
                </div>
              )}

              <div>
                <dt className={factLabel}>Session</dt>
                <dd className="mt-2 flex flex-wrap items-center gap-2">
                  {/* A substitute is never described as a park session (§11). */}
                  {isSubstitute ? (
                    <span className="flex flex-col gap-1">
                      <span className="w-fit rounded-full border-l-4 border-yellow bg-pale px-3 py-1.5 text-sm font-bold text-yellow-ink">
                        {SUBSTITUTE_LABEL}
                      </span>
                      {/* The stored reason, in today's words. The kind is
                          historical; the sentence explaining it is current
                          presentation copy. */}
                      {record.substituteReason !== undefined && (
                        <span className="text-sm text-navy-muted">
                          {SUBSTITUTE_REASON[record.substituteReason]}
                        </span>
                      )}
                    </span>
                  ) : featuresUsed.length > 0 ? (
                    featuresUsed.map((id) => (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1.5 text-sm font-bold text-green-ink"
                      >
                        <FeatureGlyph id={id} className="size-5" />
                        {findSupportedFeature(id)?.label ?? id}
                      </span>
                    ))
                  ) : (
                    <span className="text-base font-bold text-navy-muted">
                      No confirmed features used
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </PageContainer>
      </section>

      {/* Layer B — the workout itself, straight from the record. */}
      <section className="border-t border-line py-8">
        <PageContainer measure="app-wide">
          <div className="max-w-3xl">
            <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
              What you did
            </h2>
            <div className="mt-5">
              <WorkoutTimeline movements={record.movements} />
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Layer C — recent activity. Answers "have I been training lately",
          and deliberately nothing more. */}
      <section className="border-t border-line py-8">
        <PageContainer measure="app-wide">
          <div className="max-w-3xl">
            <ActivityStrip activityDates={activityDates} today={today} />
          </div>
        </PageContainer>
      </section>

      {confirmed.length > 0 && (
        <section className="py-7">
          <PageContainer measure="app-wide">
            <div className="max-w-3xl">
              <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
                Anything not usable today?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-snug text-navy-muted text-pretty">
                Occupied, flooded, fenced off? Say so and MoveHere leaves it out of sessions. It
                stays on your park&rsquo;s record either way.
              </p>
              {/* Both statements on this screen are true and describe different
                  tenses. Without this line they read as a contradiction — the
                  audit found exactly that. */}
              <p className="mt-2 max-w-md text-sm leading-snug text-navy-faint text-pretty">
                {HISTORY_VS_CORRECTION}
              </p>

              <ul ref={listRef} className="mt-4 overflow-hidden rounded-2xl border border-line bg-cloud">
                {confirmed.map((feature, index) => {
                  const unusable = feature.usability.kind === 'reported-unusable';
                  const justChanged = corrected.has(feature.featureId);
                  const label =
                    findSupportedFeature(feature.featureId)?.label ?? feature.featureId;
                  return (
                    <li
                      key={feature.featureId}
                      className={[
                        'flex min-h-16 items-center gap-4 px-4 py-3',
                        index > 0 ? 'border-t border-line' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <FeatureGlyph
                        id={feature.featureId}
                        className={`size-9 shrink-0 ${unusable ? 'text-navy-faint' : 'text-green'}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block font-extrabold ${unusable ? 'text-navy-muted' : ''}`}
                        >
                          {label}
                        </span>
                        {/* State in words, not in the glyph's tint alone. */}
                        {unusable && (
                          <span
                            data-corrected-status={feature.featureId}
                            tabIndex={-1}
                            className="block rounded-sm text-sm text-navy-muted"
                          >
                            Left out of sessions{justChanged ? ' — saved' : ''}
                          </span>
                        )}
                      </span>
                      {!unusable && (
                        <button
                          type="button"
                          onClick={() => mark(feature.featureId, 'feature-unusable')}
                          aria-label={`Mark ${label} not usable`}
                          className="min-h-11 shrink-0 rounded-full border border-line px-4 text-sm font-bold text-navy-muted transition-colors duration-(--duration-quick) hover:border-line-strong hover:text-navy"
                        >
                          Not usable
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </PageContainer>
        </section>
      )}

      <section className="mt-auto border-t border-line bg-cloud pb-7 pt-5">
        <PageContainer measure="app-wide">
          <div className="flex max-w-3xl flex-col gap-3">
            {/* It ends this session and returns to setup, where the next one is
                chosen and built. "Train again" suggested repeating what was
                just done. */}
            <Action
              onClick={() => {
                endSession();
                router.push('/setup');
              }}
            >
              Set up another session
            </Action>
            <ProjectContentNote />
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
