import type { ReactNode } from 'react';

/**
 * The content measure.
 *
 * `app` is the flow measure: full-bleed padding at small sizes, a readable
 * column that stops growing well before the viewport does. Nothing in the
 * session flow is wide enough to need a dashboard grid.
 *
 * `marketing` is wider, and only the public landing page uses it. A marketing
 * page has a different job — it presents rather than guides, and a 672px column
 * on a 1440px screen reads as an app that wandered onto the web.
 *
 * `marketing-wide` is the measure taken from the approved design anchor: ~68px
 * gutters at 1440, giving ~1305px of content. The anchor is not a centred column
 * at all — it is close to full-bleed with generous padding, and `marketing` at
 * 1152px was leaving ~250px on the table and making the composition read as a
 * card rather than a page.
 *
 * The measures are named rather than parameterised by a number so a later reader
 * can see which surface a page belongs to from the call site. App-flow geometry
 * is untouched by all of this.
 */
export function PageContainer({
  children,
  className,
  measure = 'app',
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly measure?: 'app' | 'marketing' | 'marketing-wide';
}) {
  return (
    <div
      className={[
        'mx-auto w-full',
        measure === 'marketing-wide'
          ? 'max-w-[96rem] px-5 sm:px-8 lg:px-[4.25rem]'
          : measure === 'marketing'
            ? 'max-w-6xl px-5 sm:px-8 lg:px-12'
            : 'max-w-2xl px-5 sm:px-8',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
