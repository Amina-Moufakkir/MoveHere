import type { ReactNode } from 'react';

/**
 * The state before anything has been confirmed.
 *
 * MoveHere starts empty by design — it must not assume a bench, a bar, or
 * stairs exists — so this is a first-class screen rather than an apology.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  readonly title: string;
  readonly body: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[--radius-lg] border border-dashed border-line-strong bg-surface-sunken px-6 py-12 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-title font-semibold text-balance">{title}</p>
        <p className="mx-auto max-w-sm text-ink-muted text-pretty">{body}</p>
      </div>
      {action}
    </div>
  );
}
