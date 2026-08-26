import type { ComponentProps, ReactNode } from 'react';
import { ActionLink } from '@/components/ui/action';

/**
 * A stage with nothing to show yet, and the one move that fixes it.
 *
 * Four real consumers: confirm with no candidates, workout with no session,
 * workout with a session it could not build, and complete with nothing
 * finished. All four already shared a shape — title, one explanatory line, one
 * way forward — assembled by hand each time.
 *
 * **Every empty state here offers a route out.** A person who lands on one has
 * arrived somewhere the product cannot help them, usually by opening a link
 * directly or coming back to a cleared device, and a dead end at that moment
 * reads as breakage rather than as state. The action is required, not optional.
 *
 * Deliberately not an error surface. None of these four is a failure the user
 * caused, and the copy each passes in says so.
 */
export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  readonly title: string;
  readonly body: ReactNode;
  /** Typed against Link so the flow's routes stay statically checked. */
  readonly actionHref: ComponentProps<typeof ActionLink>['href'];
  readonly actionLabel: string;
}) {
  return (
    <section className="open-sky flex flex-1 flex-col justify-center py-16">
      <div className="flex w-full flex-col items-start gap-4">
        <h1 className="text-page font-extrabold text-balance">{title}</h1>
        <p className="max-w-md text-base leading-snug text-navy-muted text-pretty">{body}</p>
        <ActionLink href={actionHref} full={false}>
          {actionLabel}
        </ActionLink>
      </div>
    </section>
  );
}
