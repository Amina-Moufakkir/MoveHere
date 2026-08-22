'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Action } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import { FEATURE_REGISTRY } from '@/src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import { SHORT_HINT, SHORT_LABEL, byPresentation } from '@/src/presentation/feature-copy.ts';

export function ParkClient() {
  const router = useRouter();
  const { candidates, proposeCandidates } = useVenue();
  const [picked, setPicked] = useState<ReadonlySet<SupportedFeatureId>>(
    () => new Set(candidates.map((c) => c.featureId)),
  );

  const toggle = (id: SupportedFeatureId) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onContinue = () => {
    // Selecting produces candidates. Nothing here creates venue state.
    proposeCandidates([...picked]);
    router.push('/confirm');
  };

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-12">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink">
            Step 1 of 3 · Look around
          </p>
          <h1 className="mt-2.5 text-page font-extrabold text-balance">What do you see?</h1>
          <p className="mt-2.5 max-w-md text-base leading-snug text-navy-muted text-pretty">
            Tap anything that&rsquo;s here. You&rsquo;ll decide what MoveHere should trust on the
            next screen.
          </p>
        </div>
      </section>

      <section className="px-5 pb-6 pt-6 sm:px-8">
        <fieldset className="mx-auto w-full max-w-2xl">
          <legend className="sr-only">What you can see in the park</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[...FEATURE_REGISTRY.supported]
              .sort((a, b) => byPresentation(a.id, b.id))
              .map((feature) => {
              const on = picked.has(feature.id);
              return (
                <label
                  key={feature.id}
                  className="group relative flex h-full cursor-pointer select-none flex-col gap-3 rounded-2xl border border-line bg-cloud p-5 transition-[transform,background-color,border-color] duration-(--duration-quick) ease-(--ease-spring) hover:border-line-strong active:scale-[0.985] has-checked:border-blue has-checked:bg-blue has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus"
                >
                  <input
                    type="checkbox"
                    name="feature"
                    value={feature.id}
                    checked={on}
                    onChange={() => toggle(feature.id)}
                    className="sr-only"
                  />
                  <span className="flex items-start justify-between gap-2">
                    <span className="contents">
                      <FeatureGlyph
                        id={feature.id}
                        className="size-16 text-blue transition-colors duration-(--duration-quick) group-has-checked:text-white"
                      />
                    </span>
                    <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border-2 border-line-strong transition-colors duration-(--duration-quick) group-has-checked:border-white group-has-checked:bg-white">
                      <svg viewBox="0 0 20 20" aria-hidden className="size-4 opacity-0 transition-opacity duration-(--duration-quick) group-has-checked:opacity-100">
                        <path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" className="text-blue" />
                      </svg>
                    </span>
                  </span>
                  <span className="mt-auto">
                    <span className="block text-lg font-extrabold leading-tight tracking-[-0.02em] text-navy transition-colors duration-(--duration-quick) group-has-checked:text-white">
                      {SHORT_LABEL[feature.id]}
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-navy-muted transition-colors duration-(--duration-quick) group-has-checked:text-white/90">
                      {SHORT_HINT[feature.id]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </section>

      <section className="mt-auto border-t border-line bg-cloud px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <Action onClick={onContinue} disabled={picked.size === 0}>
            {picked.size === 0 ? 'Pick what you can see' : `Continue with ${picked.size}`}
          </Action>
          <p className="text-center text-sm leading-snug text-navy-muted">
            Nothing is trusted yet. Nothing leaves your phone.
          </p>
        </div>
      </section>
    </div>
  );
}
