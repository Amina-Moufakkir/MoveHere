'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Action } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import { FEATURE_REGISTRY } from '@/src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import { SHORT_HINT, SHORT_LABEL, byPresentation } from '@/src/presentation/feature-copy.ts';
import { PageHeading } from '@/components/shell/page-heading';
import { PageContainer } from '@/components/shell/page-container';
import { SelectableCard } from '@/components/ui/selectable-card';

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
      <section className="open-sky pb-7 pt-8 sm:pb-9 sm:pt-12">
        <PageContainer measure="app-wide">
          <PageHeading
            eyebrow="Step 1 of 3"
            title="What do you see?"
            lede={
              <>
                Tap anything that&rsquo;s here. You&rsquo;ll confirm what MoveHere can actually
                use on the next screen.
              </>
            }
          />
        </PageContainer>
      </section>

      {/* The selection surface takes the wider measure; the prose above does
          not. Eight cards in a 672px column left four of them wrapping their
          own names at desktop while several hundred pixels sat unused either
          side. Widening a grid is not the same as widening a paragraph. */}
      <section className="pb-6 pt-6">
        <PageContainer measure="app-wide">
          <fieldset>
            <legend className="sr-only">What you can see in the park</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {[...FEATURE_REGISTRY.supported]
                .sort((a, b) => byPresentation(a.id, b.id))
                .map((feature) => {
                  const on = picked.has(feature.id);
                  return (
                    <SelectableCard
                      key={feature.id}
                      type="checkbox"
                      name="feature"
                      value={feature.id}
                      checked={on}
                      onChange={() => toggle(feature.id)}
                      className="h-full flex-col gap-3 p-5"
                    >
                      <span className="flex items-start justify-between gap-2">
                        <FeatureGlyph
                          id={feature.id}
                          className="size-14 text-blue transition-colors duration-(--duration-quick) group-has-checked:text-white sm:size-16"
                        />
                        {/* A mark, not a colour. The checked state is carried by
                            the input for assistive technology and by this tick
                            for anyone who cannot rely on the fill. */}
                        <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-full border-2 border-line-strong transition-colors duration-(--duration-quick) group-has-checked:border-white group-has-checked:bg-white">
                          <svg
                            viewBox="0 0 20 20"
                            aria-hidden
                            className="size-4 opacity-0 transition-opacity duration-(--duration-quick) group-has-checked:opacity-100"
                          >
                            <path
                              d="M4.5 10.5l3.5 3.5 7.5-8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.75"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-blue"
                            />
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
                    </SelectableCard>
                  );
                })}
            </div>
          </fieldset>
        </PageContainer>
      </section>

      <section className="mt-auto border-t border-line bg-cloud py-6">
        <PageContainer measure="app-wide" className="flex flex-col gap-3">
          <Action onClick={onContinue} disabled={picked.size === 0}>
            {picked.size === 0 ? 'Pick what you can see' : `Continue with ${picked.size}`}
          </Action>
          <p className="text-center text-sm leading-snug text-navy-muted">
            Nothing is trusted yet. Nothing leaves your phone.
          </p>
        </PageContainer>
      </section>
    </div>
  );
}
