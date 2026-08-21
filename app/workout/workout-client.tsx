'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { Action, ActionLink } from '@/components/ui/action';
import { ProjectContentNote } from '@/components/labels/project-content-note';
import { useVenue } from '@/components/venue/venue-provider';
import { exerciseCues, exerciseName } from '@/src/programming/session-builder.ts';
import { findSupportedFeature } from '@/src/domain/feature-registry.ts';
import { SUBSTITUTE_LABEL, SUBSTITUTE_REASON } from '@/src/presentation/session-copy.ts';
import { doseParts, doseText, isSingleEffort } from '@/src/presentation/prescription-copy.ts';

export function WorkoutClient() {
  const router = useRouter();
  const { session, workout, setDone, completeSession, startSession } = useVenue();

  const items = useMemo(
    () =>
      workout !== null && workout.kind !== 'not-generated'
        ? workout.blocks.flatMap((b) => b.items.map((item) => ({ block: b.name, item })))
        : [],
    [workout],
  );

  if (session === null || workout === null) {
    return (
      <section className="open-sky flex flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4">
          <h1 className="text-page font-extrabold">No session yet</h1>
          <p className="max-w-md text-base leading-snug text-navy-muted">
            Choose how long you have and MoveHere will build one.
          </p>
          <ActionLink href="/setup" full={false}>Set up a session</ActionLink>
        </div>
      </section>
    );
  }

  if (workout.kind === 'not-generated') {
    return (
      <section className="open-sky flex flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4">
          <h1 className="text-page font-extrabold">Couldn&rsquo;t build a session</h1>
          <p className="max-w-md text-base leading-snug text-navy-muted">
            {workout.reason === 'insufficient-time'
              ? 'There isn’t enough time for a full session at this length.'
              : 'No movements are available. This is a content problem, not something you did.'}
          </p>
          <ActionLink href="/setup" full={false}>Change the session</ActionLink>
        </div>
      </section>
    );
  }

  const total = items.length;
  const done = Math.min(session.done, total);
  const current = items[Math.min(done, total - 1)];
  const isSubstitute = workout.kind === 'substitute-session';
  const finished = done >= total;

  const advance = () => {
    if (done + 1 >= total) {
      setDone(total);
      completeSession(new Date().toISOString(), {
        movements: total,
        featuresUsed: workout.kind === 'park-session' ? [...workout.featuresUsed] : [],
        wasSubstitute: workout.kind === 'substitute-session',
      });
      router.push('/complete');
      return;
    }
    setDone(done + 1);
  };

  const [big, small] = current === undefined ? ['', ''] : doseParts(current.item.prescription);
  const basis = current?.item.basis;
  const featureLabel =
    basis?.kind === 'confirmed-feature'
      ? (findSupportedFeature(basis.featureId)?.label ?? basis.featureId)
      : null;

  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky flex flex-1 flex-col px-5 pb-8 pt-5 sm:px-8 sm:pt-7">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
          <div
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Movements completed"
            className="flex gap-1.5"
          >
            {items.map((entry, i) => (
              <span
                key={`${entry.item.exerciseId}-${i}`}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-(--duration-settle) ${
                  i < done ? 'bg-green' : i === done ? 'bg-blue' : 'bg-line-strong/60'
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
            <div className="mt-4 rounded-xl border-l-4 border-yellow bg-white px-4 py-3 shadow-(--shadow-lift)">
              <p className="text-sm font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-yellow-ink">
                {SUBSTITUTE_LABEL}
              </p>
              <p className="mt-1 text-sm leading-snug text-navy-muted">
                {SUBSTITUTE_REASON[workout.reason.kind]}
              </p>
            </div>
          )}

          {current !== undefined && (
            <div className="flex flex-1 flex-col justify-center gap-6 py-8">
              <div className="flex flex-col gap-3">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) shadow-(--shadow-lift)">
                  <span
                    aria-hidden
                    className={`size-1.5 rounded-full ${featureLabel === null ? 'bg-blue' : 'bg-green'}`}
                  />
                  <span className={featureLabel === null ? 'text-navy-muted' : 'text-green-ink'}>
                    {featureLabel === null ? 'No equipment' : `Using the ${featureLabel}`}
                  </span>
                </span>
                <h1 className="text-hero font-extrabold text-balance">
                  {exerciseName(current.item.exerciseId)}
                </h1>
              </div>

              <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
                <p className="flex items-baseline gap-2.5 leading-none text-blue-ink">
                  <span className="text-count font-extrabold tabular-nums">{big}</span>
                  {/* A single continuous effort is "4 min", not "4 × min". */}
                  {!isSingleEffort([big, small]) && (
                    <span className="text-3xl font-extrabold text-navy-faint sm:text-4xl">&times;</span>
                  )}
                  {/* Anything longer than two characters steps down a size so a
                      long value cannot overflow the phone. */}
                  <span
                    className={`font-extrabold tabular-nums ${
                      small.length > 2 ? 'text-5xl sm:text-7xl' : 'text-count'
                    }`}
                  >
                    {small}
                  </span>
                </p>
                <p className="pb-2 text-marker font-extrabold uppercase leading-snug tracking-(--text-marker--letter-spacing) text-navy-muted">
                  {doseText(current.item.prescription)}
                  <br />
                  {current.block}
                </p>
              </div>

              <ul className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-(--shadow-lift) sm:p-5">
                {exerciseCues(current.item.exerciseId).map((cue) => (
                  <li key={cue} className="flex items-start gap-2.5 text-base leading-snug sm:text-lg">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-blue" />
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-white px-5 pb-7 pt-5 sm:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3.5">
          <Action onClick={advance}>{done + 1 >= total ? 'Finish session' : 'Done'}</Action>

          <div className="flex items-baseline justify-between gap-4 text-sm font-semibold text-navy-muted">
            <span>
              {done + 1 < total
                ? `Next — ${exerciseName(items[done + 1]!.item.exerciseId)}`
                : 'Last movement'}
            </span>
            <span className="tabular-nums">{Math.max(total - done - 1, 0)} to go</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <ProjectContentNote className="flex-1" />
            {!finished && (
              <button
                type="button"
                onClick={() => startSession(crypto.randomUUID())}
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-sm font-bold text-navy-muted transition-colors duration-(--duration-quick) hover:border-line-strong hover:text-navy"
              >
                Generate another
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
