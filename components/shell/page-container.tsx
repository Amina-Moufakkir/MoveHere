import type { ReactNode } from 'react';

/**
 * The single content measure for the whole app.
 *
 * Mobile-first: full-bleed padding at small sizes, a readable column that
 * stops growing well before the viewport does. Nothing in MoveHere is wide
 * enough to need a dashboard grid.
 */
export function PageContainer({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={['mx-auto w-full max-w-2xl px-5 sm:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
