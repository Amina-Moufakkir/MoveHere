'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Action, ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import type { ConfirmationDecision } from '@/src/domain/confirmation.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import { byPresentation } from '@/src/presentation/feature-copy.ts';
import {
  consequenceFor,
  movementCountFor,
} from '@/src/presentation/feature-consequence.ts';
import { PageHeading } from '@/components/shell/page-heading';
import { EmptyState } from '@/components/shell/empty-state';
import { PageContainer } from '@/components/shell/page-container';

const DECISIONS: readonly { value: ConfirmationDecision; label: string }[] = [
  { value: 'present', label: 'Yes' },
  { value: 'unsure', label: 'Not sure' },
  { value: 'absent', label: 'No' },
];

export function ConfirmClient() {
  const router = useRouter();
  const { candidates, confirm } = useVenue();
  /**
   * Starts empty. Absence is meaningful.
   *
   * Seeding every candidate to `present` would confirm everything for a user
   * who taps straight through, which is a soft yes by default. §6.3 is explicit
   * that `unsure` is a real outcome and not a soft yes — precision over recall,
   * because a missed feature costs options while an invented one creates
   * physical risk. An unanswered candidate carries no entry here and reaches
   * the confirmation contract's own `?? 'unsure'` default.
   */
  const [decisions, setDecisions] = useState<ReadonlyMap<SupportedFeatureId, ConfirmationDecision>>(
    () => new Map(),
  );

  // Same order as /park, so the review reads as a continuation rather than a
  // reshuffled list of the same things.
  const ordered = useMemo(
    () => [...candidates].sort((a, b) => byPresentation(a.featureId, b.featureId)),
    [candidates],
  );

  const trusted = useMemo(
    () => ordered.filter((c) => decisions.get(c.featureId) === 'present'),
    [ordered, decisions],
  );

  const movementCount = useMemo(
    () => movementCountFor(trusted.map((c) => c.featureId)),
    [trusted],
  );

  const set = (id: SupportedFeatureId, value: ConfirmationDecision) =>
    setDecisions((prev) => new Map(prev).set(id, value));

  if (candidates.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <PageContainer className="flex flex-1 flex-col">
          <EmptyState
            title="Nothing to confirm yet"
            body="Tell MoveHere what you can see first. Confirmation is the only way a feature enters your park."
            actionHref="/park"
            actionLabel="Look around"
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-12">
        <div className="mx-auto w-full max-w-2xl">
          <PageHeading
            eyebrow="Step 2 of 3"
            title="What should MoveHere trust?"
            lede={
              <>
                Only what you confirm here is used to build a session. If you&rsquo;re not certain
                something is usable, say so — it costs you options, not a wasted trip.
              </>
            }
          />
        </div>
      </section>

      <section className="px-5 pb-6 pt-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {ordered.map((candidate) => {
            const feature = findSupportedFeature(candidate.featureId);
            const answered = decisions.get(candidate.featureId);
            const decision = answered ?? 'unsure';
            const isTrusted = decision === 'present';
            const consequence = consequenceFor(candidate.featureId, isTrusted);

            return (
              <fieldset
                key={candidate.featureId}
                className="border-t border-line py-5"
              >
                <legend className="sr-only">{feature?.label ?? candidate.featureId}</legend>

                <div className="flex items-start gap-3.5">
                  <span
                    className="contents"
                  >
                    <FeatureGlyph
                      id={candidate.featureId}
                      className={`size-10 shrink-0 transition-colors duration-(--duration-quick) ${isTrusted ? 'text-green' : 'text-navy-faint'}`}
                    />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-extrabold leading-tight tracking-[-0.02em]">
                      {feature?.label ?? candidate.featureId}
                    </p>
                    <p className="mt-0.5 text-sm leading-snug text-navy-muted text-pretty">
                      {feature?.confirmationPrompt}
                    </p>

                    {/* The consequence of trusting it — the thing /park cannot show. */}
                    {consequence !== null && (
                      <p
                        className={`mt-2 text-sm leading-snug transition-colors duration-(--duration-quick) ${
                          isTrusted ? 'font-bold text-green-ink' : 'text-navy-faint'
                        }`}
                      >
                        {consequence}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-full border border-line-strong">
                  {DECISIONS.map((option) => (
                    <label
                      key={option.value}
                      className="relative flex min-h-11 cursor-pointer items-center justify-center px-2 text-sm font-bold text-navy-muted transition-colors duration-(--duration-quick) hover:text-navy has-checked:bg-blue has-checked:text-white has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:-outline-offset-3 has-focus-visible:outline-focus"
                    >
                      <input
                        type="radio"
                        name={`decision-${candidate.featureId}`}
                        value={option.value}
                        checked={answered === option.value}
                        onChange={() => set(candidate.featureId, option.value)}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>

                {answered === undefined && (
                  <p className="mt-2.5 text-sm leading-snug text-navy-faint">
                    Unanswered — counts as not sure
                  </p>
                )}
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className="mt-auto border-t border-line bg-cloud px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <p aria-live="polite" className="text-center text-sm font-semibold text-navy-muted">
            {trusted.length === 0
              ? 'Nothing confirmed — sessions will use no-equipment movements'
              : `${trusted.length} confirmed · ${movementCount} movements available`}
          </p>
          <Action
            onClick={() => {
              confirm(decisions);
              router.push('/setup');
            }}
          >
            Confirm and continue
          </Action>
          <ActionLink href="/park" variant="quiet" full={false} className="self-center">
            Back to look again
          </ActionLink>
        </div>
      </section>
    </div>
  );
}
