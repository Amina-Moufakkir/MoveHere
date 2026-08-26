'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Action } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { ProjectContentNote } from '@/components/labels/project-content-note';
import { useVenue } from '@/components/venue/venue-provider';
import { byPresentation } from '@/src/presentation/feature-copy.ts';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import { SUBSTITUTE_LABEL } from '@/src/presentation/session-copy.ts';
import { EmptyState } from '@/components/shell/empty-state';
import { PageContainer } from '@/components/shell/page-container';

export function CompleteClient() {
  const router = useRouter();
  const { session, inventory, correct, endSession } = useVenue();
  const [corrected, setCorrected] = useState<ReadonlySet<SupportedFeatureId>>(new Set());

  // Read from the snapshot taken at completion, never re-derived. Correcting a
  // feature afterwards must not rewrite the session that was just done.
  const summary = session?.summary ?? null;
  const featuresUsed = (summary?.featuresUsed ?? []) as readonly SupportedFeatureId[];
  const movements = summary?.movements ?? 0;

  const confirmed = [...(inventory?.features ?? [])].sort((a, b) =>
    byPresentation(a.featureId, b.featureId),
  );

  const isSubstitute = summary?.wasSubstitute ?? false;

  if (session === null || session.completedAt === null) {
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
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Celebrate first. The correction ask comes after, not instead. */}
      <section className="open-sky px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-green-ink">
            Session complete
          </p>
          <h1 className="mt-2 text-page font-extrabold text-balance">
            You moved here.
          </h1>
          <p className="mt-4 flex items-baseline gap-3 leading-none text-blue-vivid">
            <span className="text-count font-extrabold tabular-nums">{session.minutes}</span>
            <span className="text-xl font-extrabold text-navy-muted sm:text-2xl">minutes</span>
          </p>
          <p className="mt-4 text-sm font-bold text-navy-muted">
            {movements} movements · <span className="capitalize">{session.goal}</span>
            {isSubstitute ? ' · No equipment needed' : ''}
          </p>

          {!isSubstitute && featuresUsed.length > 0 && (
            <p className="mt-5 text-sm font-bold text-navy-muted">Used in this session</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {isSubstitute ? (
              <span className="rounded-full border-l-4 border-yellow bg-pale px-3 py-1.5 text-sm font-bold text-yellow-ink">
                {SUBSTITUTE_LABEL}
              </span>
            ) : (
              featuresUsed.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1.5 text-sm font-bold text-green-ink"
                >
                  <FeatureGlyph id={id} className="size-5" />
                  {findSupportedFeature(id)?.label ?? id}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {confirmed.length > 0 && (
        <section className="px-5 py-7 sm:px-8">
          <div className="mx-auto w-full max-w-2xl">
            <h2 className="text-sm font-bold text-navy-muted">
              Anything not usable today?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-snug text-navy-muted text-pretty">
              Occupied, flooded, fenced off? Say so and MoveHere leaves it out of sessions. It stays
              on your park&rsquo;s record either way.
            </p>

            <ul className="mt-4 flex flex-col border-t border-line">
              {confirmed.map((feature) => {
                const unusable = feature.usability.kind === 'reported-unusable';
                const justChanged = corrected.has(feature.featureId);
                return (
                  <li
                    key={feature.featureId}
                    className="flex min-h-14 items-center gap-4 border-b border-line py-3"
                  >
                    <FeatureGlyph
                      id={feature.featureId}
                      className={`size-10 shrink-0 ${unusable ? 'text-navy-faint' : 'text-green'}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block font-extrabold ${unusable ? 'text-navy-muted' : ''}`}>
                        {findSupportedFeature(feature.featureId)?.label ?? feature.featureId}
                      </span>
                      {unusable && (
                        <span className="block text-sm text-navy-muted">
                          Left out of sessions{justChanged ? ' — saved' : ''}
                        </span>
                      )}
                    </span>
                    {!unusable && (
                      <button
                        type="button"
                        onClick={() => mark(feature.featureId, 'feature-unusable')}
                        className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm font-bold text-navy-muted transition-colors duration-(--duration-quick) hover:border-line-strong hover:text-navy"
                      >
                        Not usable
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      <section className="mt-auto border-t border-line bg-cloud px-5 pb-7 pt-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <Action
            onClick={() => {
              endSession();
              router.push('/setup');
            }}
          >
            Train again
          </Action>
          <ProjectContentNote />
        </div>
      </section>
    </div>
  );
}
