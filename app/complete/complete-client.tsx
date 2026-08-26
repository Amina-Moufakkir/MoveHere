'use client';

import { useRouter } from 'next/navigation';
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
import { SUBSTITUTE_LABEL } from '@/src/presentation/session-copy.ts';
import { EmptyState } from '@/components/shell/empty-state';
import { PageContainer } from '@/components/shell/page-container';

/**
 * The end of one session.
 *
 * **What is shown is what was programmed, never what was achieved.** The screen
 * used to lead with "30" at display size above the word "minutes", directly
 * under "Session complete", which reads as thirty minutes of training. MoveHere
 * records no elapsed time — it records that a session with a thirty-minute
 * prescription was marked done. v4.6 §23.1 is explicit that prescribed duration
 * may never be presented as time trained, so the number is now labelled
 * "Programmed duration" and set as one fact among several rather than as the
 * screen's trophy.
 *
 * The facts are a description list because that is what they are: a label and a
 * value, four times. They are set in neutral ink, not in the completion green —
 * the session ending is the thing worth acknowledging, and tinting the numbers
 * with it would make each one look like an achievement.
 *
 * **This is closure, not analytics.** Nothing here counts sessions, compares
 * them, or persists anything beyond the completion the flow already wrote.
 * Progress and history are PLANNED and unbuilt (§23.1), and a completion screen
 * is exactly where they would be invented by accident.
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

  /* Rendered from the immutable Activity record, never from live state and
     never from the generator (§24.3). The record is read after mount because it
     lives on the device and the page is prerendered; `loaded` distinguishes
     "not read yet" from "nothing to show", so the empty state cannot flash
     before the record arrives. */
  const [record, setRecord] = useState<ActivityRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRecord(activityStore().list()[0] ?? null);
    setLoaded(true);
  }, []);

  const featuresUsed = (record?.featuresUsed ?? []) as readonly SupportedFeatureId[];
  const movements = record?.movements.length ?? 0;

  const confirmed = [...(inventory?.features ?? [])].sort((a, b) =>
    byPresentation(a.featureId, b.featureId),
  );

  const isSubstitute = record?.kind === 'substitute-session';

  /* Nothing renders until the record has been read. Rendering the summary with
     no record would show "0 min" for a frame; rendering the empty state would
     claim nothing was finished before we had looked. */
  if (!loaded) return null;

  if (record === null) {
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
                    <span className="rounded-full border-l-4 border-yellow bg-pale px-3 py-1.5 text-sm font-bold text-yellow-ink">
                      {SUBSTITUTE_LABEL}
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
