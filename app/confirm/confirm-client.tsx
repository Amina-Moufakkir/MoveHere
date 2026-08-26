'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Action, ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import { restoreDecisions } from '@/src/storage/venue-state.ts';
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
  const { candidates, confirm, inventory } = useVenue();
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
  /**
   * Restored from recorded authority, never inferred from candidate presence.
   *
   * Starting blank meant that revisiting this screen and continuing replaced a
   * populated inventory with an empty one — the confirmed park erased by an
   * ordinary back-navigation, with the destructive path sitting under the
   * primary action. Only `present` decisions ever produce a confirmed feature,
   * so a feature recorded in the inventory *is* a recorded Yes and may be shown
   * as one.
   *
   * A candidate that is merely proposed restores nothing. The precision-over-
   * recall default (Invariant 4) governs a first pass, and this must not become
   * a way of answering on the user's behalf.
   */
  const [decisions, setDecisions] = useState<ReadonlyMap<SupportedFeatureId, ConfirmationDecision>>(
    () => restoreDecisions(inventory),
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
            body="Tell MoveHere what you can see first. Confirming a feature is the only way it reaches your workout."
            actionHref="/park"
            actionLabel="Look around"
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky pb-7 pt-8 sm:pb-9 sm:pt-12">
        <PageContainer measure="app-wide">
          <PageHeading
            eyebrow="Step 2 of 3"
            title="Confirm what&rsquo;s available"
            lede={
              <>
                Review what you found. MoveHere will use only the features you confirm here to
                build your workout. If you&rsquo;re not certain something is usable, choose Not
                sure.
              </>
            }
          />
        </PageContainer>
      </section>

      <section className="pb-6 pt-5">
        <PageContainer measure="app-wide" className="flex flex-col gap-3">
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

              {/* Two zones from lg. The question and its consequence keep a
                  readable measure on the left; the decision sits beside them
                  rather than below, so the extra width buys a shorter scroll
                  and a tighter question-to-answer distance instead of longer
                  lines. Below lg they stack, unchanged. */}
              <div className="lg:grid lg:grid-cols-[1fr_21rem] lg:items-center lg:gap-8">
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


                <div className="mt-4 lg:mt-0">
                  <div className="grid grid-cols-3 overflow-hidden rounded-full border border-line-strong">
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

                  {/* Directly beneath the control it describes, in both
                      layouts. As a third grid item it drifted into its own row
                      and read as unrelated to the question above it. */}
                  {answered === undefined && (
                    <p className="mt-2.5 text-sm leading-snug text-navy-faint">
                      Unanswered — counts as not sure
                    </p>
                  )}
                </div>
                </div>
              </fieldset>
            );
          })}
        </PageContainer>
      </section>

      <section className="mt-auto border-t border-line bg-cloud py-6">
        <PageContainer measure="app-wide" className="flex flex-col gap-3">
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
        </PageContainer>
      </section>
    </div>
  );
}
