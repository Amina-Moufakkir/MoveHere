import Link from 'next/link';
import { FLOW_STEPS, flowIndexFor, stageStateFor } from '@/components/shell/flow';
import type { FlowFacts } from '@/components/shell/flow';

/**
 * Where you are in this session's flow.
 *
 * **Workflow progress, never fitness progress.** It answers "how far through
 * setting up and doing this session am I", and it resets the moment a new one
 * starts. It says nothing about how often someone trains, whether they are
 * improving, or what they did last week — those are PLANNED capabilities and
 * unbuilt (§23.1), and a progress indicator is exactly the surface that would
 * imply them by accident.
 *
 * Colour follows the operational mapping rather than the brand: green for
 * stages completed — the same green the workout's own movement track already
 * uses for finished segments — and blue for the stage you are on, because blue
 * is the current choice everywhere else in the flow (§15). Park olive is the
 * marketing brand and has no state to express here.
 *
 * **State is never carried by colour alone.** Each step also renders its name
 * and its condition as text for assistive technology, and the current step is
 * marked with `aria-current="step"`.
 *
 * Each interactive stage keeps a 44px hit area (`min-h-11`) even though the bar
 * it draws is 6px tall. The header's own height is fixed, so the target grows
 * into space that already existed rather than pushing the chrome taller.
 *
 * Completed and current stages are links; stages ahead are not. A person can go
 * back and change what they told MoveHere — that is the correction path the
 * product depends on — but jumping forward into a session that has not been
 * built yet only lands on an empty state.
 */
export function FlowProgress({
  pathname,
  facts,
}: {
  readonly pathname: string;
  readonly facts: FlowFacts;
}) {
  const activeIndex = flowIndexFor(pathname);
  return (
    <nav aria-label="Session progress">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {FLOW_STEPS.map((step, index) => {
          /* State comes from what the user has actually done, not from where
             they are standing (§24.14). Deriving "completed" from route order
             let a cold deep link claim three finished stages. */
          const stage = stageStateFor(index, pathname, facts);
          const isCurrent = stage === 'current-view';
          const isDone = stage === 'reached';
          const state = isCurrent ? ' (current step)' : isDone ? ' (reached)' : ' (not started)';

          const bar = (
            <span
              aria-hidden
              className={[
                'block h-1.5 rounded-full transition-all duration-(--duration-settle) ease-(--ease-spring)',
                isCurrent
                  ? 'w-7 bg-blue-deep sm:w-9'
                  : isDone
                    ? 'w-3 bg-green sm:w-4'
                    : 'w-3 bg-line-strong sm:w-4',
              ].join(' ')}
            />
          );

          /* The label rides beside the bar from sm up. Below that the bars are
             the whole indicator and the current stage is named once, next to
             them — four labels at phone width would crowd out the wordmark. */
          const name = (
            <span
              aria-hidden
              className={[
                'hidden text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) lg:block',
                isCurrent ? 'text-blue-ink' : isDone ? 'text-green-ink' : 'text-navy-faint',
              ].join(' ')}
            >
              {step.label}
            </span>
          );

          const body = (
            <>
              <span className="sr-only">
                {step.label}
                {state}
              </span>
              {bar}
              {name}
            </>
          );

          return (
            <li key={step.href} className="flex items-center">
              {isDone || isCurrent ? (
                <Link
                  href={step.href}
                  aria-current={isCurrent ? 'step' : undefined}
                  className="group flex min-h-11 items-center gap-1.5 rounded-sm px-1"
                >
                  {body}
                </Link>
              ) : (
                <span className="flex min-h-11 items-center gap-1.5 px-1">{body}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
