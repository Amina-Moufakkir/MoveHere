import type { ReactNode } from 'react';
import { Heading, Lede } from '@/components/ui/heading';
import { PageContainer } from '@/components/shell/page-container';

/**
 * The shared frame for every step in the flow.
 *
 * One h1 per page, an optional eyebrow that is decorative rather than a
 * heading, and a footer region pinned below the content for the primary
 * action. Keeps hierarchy identical across all six routes.
 */
export function StepPage({
  eyebrow,
  title,
  lede,
  children,
  footer,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly lede?: string;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}) {
  return (
    <PageContainer className="flex flex-1 flex-col gap-8 py-10 sm:py-14">
      <div className="flex flex-col gap-3">
        {eyebrow !== undefined && (
          <p className="text-label font-semibold uppercase tracking-(--text-label--letter-spacing) text-persimmon-deep">
            {eyebrow}
          </p>
        )}
        <Heading level={1} size="title">
          {title}
        </Heading>
        {lede !== undefined && <Lede>{lede}</Lede>}
      </div>

      <div className="flex flex-1 flex-col gap-6">{children}</div>

      {footer !== undefined && (
        <div className="flex flex-col gap-4 border-t border-rule pt-6">{footer}</div>
      )}
    </PageContainer>
  );
}
