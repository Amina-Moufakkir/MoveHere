import type { ReactNode } from 'react';

/**
 * Surfaces are separated by line weight first and shadow second. Elevation is
 * a hint, not a stack of floating panels.
 */
export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'section' | 'article' | 'li';
}) {
  return (
    <Tag
      className={[
        'rounded-[--radius-lg] border border-rule bg-chalk-raised p-5 shadow-(--shadow-raised) sm:p-6',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
