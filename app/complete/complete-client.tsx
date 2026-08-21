'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Action, ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { ProjectContentNote } from '@/components/labels/project-content-note';
import { useVenue } from '@/components/venue/venue-provider';
import { byPresentation } from '@/src/presentation/feature-copy.ts';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';

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
      <section className="open-sky flex flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4">
          <h1 className="text-page font-extrabold">Nothing finished yet</h1>
          <p className="max-w-md text-base leading-snug text-navy-muted">
            Complete a session and this is where it lands.
          </p>
          <ActionLink href="/setup" full={false}>Set up a session</ActionLink>
        </div>
      </section>
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
          <p className="mt-3 flex items-baseline gap-3 leading-none text-blue-ink">
            <span className="text-count font-extrabold tabular-nums">{session.minutes}</span>
            <span className="text-xl font-extrabold text-navy-muted sm:text-2xl">minutes</span>
          </p>
          <h1 className="mt-4 text-page font-extrabold text-balance">
            {movements} movements done.
            {isSubstitute ? ' No equipment needed.' : ''}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold capitalize text-navy-muted shadow-(--shadow-lift)">
              {session.goal}
            </span>
            {isSubstitute ? (
              <span className="rounded-full border-l-4 border-yellow bg-white px-3 py-1.5 text-sm font-bold text-yellow-ink shadow-(--shadow-lift)">
                Substitute session
              </span>
            ) : (
              featuresUsed.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1.5 text-sm font-bold text-green-ink"
                >
                  <FeatureGlyph id={id} className="size-4" />
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
            <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-muted">
              Anything not usable today?
            </h2>
            <p className="mt-2 max-w-md text-sm leading-snug text-navy-muted text-pretty">
              Occupied, flooded, fenced off? Say so and MoveHere leaves it out of sessions. It stays
              on your park&rsquo;s record either way.
            </p>

            <ul className="mt-4 flex flex-col gap-2.5">
              {confirmed.map((feature) => {
                const unusable = feature.usability.kind === 'reported-unusable';
                const justChanged = corrected.has(feature.featureId);
                return (
                  <li
                    key={feature.featureId}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-(--duration-quick) ${
                      unusable ? 'bg-cloud-deep' : 'bg-white shadow-(--shadow-lift)'
                    }`}
                  >
                    <FeatureGlyph
                      id={feature.featureId}
                      className={`size-6 shrink-0 ${unusable ? 'text-navy-faint' : 'text-blue-ink'}`}
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

      <section className="mt-auto border-t border-line bg-white px-5 pb-7 pt-5 sm:px-8">
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
