'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Action, ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { useVenue } from '@/components/venue/venue-provider';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import { loadMatrix } from '@/src/domain/matrix-loader.ts';
import { AUTHORED_MATRIX } from '@/src/domain/exercise-catalog.ts';
import type { ConfirmationDecision } from '@/src/domain/confirmation.ts';
import type { SupportedFeatureId } from '@/src/domain/feature.ts';
import { byPresentation } from '@/src/presentation/feature-copy.ts';

/**
 * What each feature actually unlocks.
 *
 * This is why confirming is not a repeat of selecting: choosing on /park says
 * what is there, and this screen shows what trusting it will change. Read
 * straight from the validated matrix, so the answer is the real one.
 */
const matrix = (() => {
  const result = loadMatrix(AUTHORED_MATRIX);
  return result.ok ? result.matrix : null;
})();

const unlockedBy = (featureId: SupportedFeatureId): readonly string[] => {
  if (matrix === null) return [];
  const names = matrix.compatibilities
    .filter((c) => c.featureId === featureId)
    .map((c) => matrix.exercises.find((e) => e.id === c.exerciseId)?.name)
    .filter((n): n is string => n !== undefined);
  return [...new Set(names)].sort();
};

const DECISIONS: readonly { value: ConfirmationDecision; label: string }[] = [
  { value: 'present', label: 'Yes' },
  { value: 'unsure', label: 'Not sure' },
  { value: 'absent', label: 'No' },
];

export function ConfirmClient() {
  const router = useRouter();
  const { candidates, confirm } = useVenue();
  const [decisions, setDecisions] = useState<ReadonlyMap<SupportedFeatureId, ConfirmationDecision>>(
    () => new Map(candidates.map((c) => [c.featureId, 'present' as ConfirmationDecision])),
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
    () => new Set(trusted.flatMap((c) => unlockedBy(c.featureId))).size,
    [trusted],
  );

  const set = (id: SupportedFeatureId, value: ConfirmationDecision) =>
    setDecisions((prev) => new Map(prev).set(id, value));

  if (candidates.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <section className="open-sky flex flex-1 flex-col justify-center px-5 py-16 sm:px-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4">
            <h1 className="text-page font-extrabold">Nothing to confirm yet</h1>
            <p className="max-w-md text-base leading-snug text-navy-muted">
              Tell MoveHere what you can see first. Confirmation is the only way a feature enters
              your park.
            </p>
            <ActionLink href="/park" full={false}>
              Look around
            </ActionLink>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky px-5 pb-7 pt-8 sm:px-8 sm:pb-9 sm:pt-12">
        <div className="mx-auto w-full max-w-2xl">
          <p className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink">
            Step 2 of 3 · Confirm
          </p>
          <h1 className="mt-2.5 text-page font-extrabold text-balance">
            What should MoveHere trust?
          </h1>
          <p className="mt-2.5 max-w-md text-base leading-snug text-navy-muted text-pretty">
            Only what you confirm here is used to build a session. If you&rsquo;re not certain
            something is usable, say so — it costs you options, not a wasted trip.
          </p>
        </div>
      </section>

      <section className="px-5 pb-6 pt-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          {ordered.map((candidate) => {
            const feature = findSupportedFeature(candidate.featureId);
            const decision = decisions.get(candidate.featureId) ?? 'unsure';
            const unlocks = unlockedBy(candidate.featureId);
            const isTrusted = decision === 'present';

            return (
              <fieldset
                key={candidate.featureId}
                className={`rounded-xl border p-4 transition-colors duration-(--duration-quick) sm:p-5 ${
                  isTrusted ? 'border-green/40 bg-white' : 'border-line bg-white/50'
                }`}
              >
                <legend className="sr-only">{feature?.label ?? candidate.featureId}</legend>

                <div className="flex items-start gap-3.5">
                  <span
                    className={`grid size-11 shrink-0 place-items-center rounded-lg transition-colors duration-(--duration-quick) ${
                      isTrusted ? 'bg-pale-green' : 'bg-cloud-deep'
                    }`}
                  >
                    <FeatureGlyph
                      id={candidate.featureId}
                      className={`size-6 ${isTrusted ? 'text-green-ink' : 'text-navy-faint'}`}
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
                    {unlocks.length > 0 && (
                      <p
                        className={`mt-2 text-sm leading-snug transition-colors duration-(--duration-quick) ${
                          isTrusted ? 'text-green-ink' : 'text-navy-faint'
                        }`}
                      >
                        {isTrusted ? 'Adds' : 'Would add'} {unlocks.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2">
                  {DECISIONS.map((option) => (
                    <label
                      key={option.value}
                      className="relative flex cursor-pointer items-center justify-center rounded-full border border-line bg-cloud px-2 py-2.5 text-sm font-bold transition-colors duration-(--duration-quick) hover:border-line-strong has-checked:border-transparent has-checked:bg-blue has-checked:text-white has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
                    >
                      <input
                        type="radio"
                        name={`decision-${candidate.featureId}`}
                        value={option.value}
                        checked={decision === option.value}
                        onChange={() => set(candidate.featureId, option.value)}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className="mt-auto border-t border-line bg-white/60 px-5 py-6 sm:px-8">
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
