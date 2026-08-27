import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { doseText } from '@/src/presentation/prescription-copy.ts';
import {
  featureContextText,
  groupByBlock,
  resolveMovementName,
  RETIRED_MOVEMENT_NOTE,
} from '@/src/presentation/recap-copy.ts';
import { exerciseName } from '@/src/programming/session-builder.ts';
import type { ExerciseId } from '@/src/domain/exercise.ts';
import type { RecordedMovement } from '@/src/storage/activity-record.ts';

/**
 * The workout that was actually programmed, in the order it was performed.
 *
 * **Rendered entirely from the stored record.** No generator call, no read of
 * current inventory, no substitution of today's policy for the prescriptions
 * that were given. The record holds movements, order, prescriptions, block
 * names and per-movement feature; this component's only job is to show them.
 *
 * Order is array position, and blocks are grouped by **contiguous runs** rather
 * than by unique name. Grouping by name would silently merge two separate
 * appearances of the same block and reorder the session to do it.
 *
 * A rail with a marker per movement, not a stack of cards. Seven cards is a
 * dashboard; seven rows on a rail is a workout you can read down. Deliberately
 * absent: photography, instructions, cues, and any per-row tick — the record
 * says what was programmed, and MoveHere never observed a single repetition of
 * it (§24.11).
 */

const lookup = (id: string): string | null => {
  const name = exerciseName(id as ExerciseId);
  /* exerciseName falls back to the raw id when the catalog has no entry. That
     is a sensible default elsewhere, but here it would present an identifier as
     though it were a name, so the raw id is treated as "unresolved". */
  return name === id ? null : name;
};

export function WorkoutTimeline({ movements }: { readonly movements: readonly RecordedMovement[] }) {
  const groups = groupByBlock(movements);
  let position = 0;

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group, gi) => (
        <section key={`${group.blockName}-${gi}`}>
          <h3 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
            {group.blockName}
          </h3>

          {/* The rail sits on the list, so it spans exactly the movements it
              connects rather than an arbitrary decorative height. */}
          <ol className="mt-3 border-l border-line-strong">
            {group.movements.map((movement) => {
              position += 1;
              const resolved = resolveMovementName(movement.exerciseId, lookup);
              const context = featureContextText(movement.featureId);
              return (
                <li key={`${movement.exerciseId}-${position}`} className="relative py-3 pl-6">
                  {/* The marker is a position, not a completion tick. */}
                  <span
                    aria-hidden
                    className="absolute -left-[4.5px] top-[1.35rem] size-2 rounded-full bg-line-strong"
                  />

                  {resolved.kind === 'known' ? (
                    <p className="text-lg font-extrabold leading-tight tracking-[-0.01em]">
                      {resolved.name}
                      {movement.variationLabel !== undefined && (
                        <span className="font-bold text-navy-muted"> · {movement.variationLabel}</span>
                      )}
                    </p>
                  ) : (
                    /* The movement stays, carrying the identity that was
                       recorded. Dropping it would shorten a workout somebody
                       did; naming it would be invention. */
                    <p className="text-lg font-extrabold leading-tight tracking-[-0.01em] text-navy-muted">
                      <span className="font-mono text-base">{resolved.exerciseId}</span>
                      <span className="ml-2 text-sm font-bold">({RETIRED_MOVEMENT_NOTE})</span>
                    </p>
                  )}

                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-navy-muted">
                    {doseText(movement.prescription)}
                  </p>

                  {/* Minimal truthful presentation for E1. `completed` shows
                      nothing, because it is the ordinary case and the record
                      already implies it; the other two are stated in words so
                      Recap can never call a skipped or unreached movement
                      completed (§25.17). E2 designs the real treatment. */}
                  {movement.result !== 'completed' && (
                    <p className="mt-1 text-sm font-bold text-navy-faint">
                      {movement.result === 'skipped' ? 'Skipped' : 'Not reached'}
                    </p>
                  )}

                  {context !== null && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-green-ink">
                      {movement.featureId !== null && (
                        <FeatureGlyph id={movement.featureId} className="size-4" />
                      )}
                      {context}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
