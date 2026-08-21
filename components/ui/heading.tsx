import type { ReactNode } from 'react';

/**
 * Heading level and visual size are separate props.
 *
 * Document order decides the level so the outline stays logical; `size` only
 * decides how it looks. Choosing an h3 because h2 was too big is how heading
 * hierarchies get broken for screen-reader users.
 */
export function Heading({
  level,
  size = 'title',
  children,
  className,
}: {
  readonly level: 1 | 2 | 3;
  readonly size?: 'display' | 'title' | 'section';
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const Tag = `h${level}` as const;
  const sizes = {
    display: 'text-display font-semibold text-balance',
    title: 'text-title font-semibold text-balance',
    section: 'text-label font-semibold uppercase tracking-(--text-label--letter-spacing) text-spruce-faint',
  };
  return <Tag className={[sizes[size], className].filter(Boolean).join(' ')}>{children}</Tag>;
}

export function Lede({ children }: { readonly children: ReactNode }) {
  return <p className="max-w-prose text-lede text-spruce-muted text-pretty">{children}</p>;
}
