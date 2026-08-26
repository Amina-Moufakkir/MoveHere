'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageContainer } from '@/components/shell/page-container';
import { Wordmark } from '@/components/brand/wordmark';
import { FLOW_STEPS, flowIndexFor } from '@/components/shell/flow';
import { FlowProgress } from '@/components/shell/flow-progress';

/**
 * The header inside the product.
 *
 * A different job from the marketing header, and deliberately not a smaller
 * version of it. The landing page presents and has destinations; this one is
 * chrome around a task. It carries identity, a way out, and where you are —
 * nothing else. No anchors, no CTA, no photography, no sign-in.
 *
 * The wordmark is both the brand and the exit. Its accessible name says so,
 * because "MoveHere" alone tells a screen-reader user what it is and not what
 * it does, and leaving mid-session is the one navigation a person may actually
 * want.
 *
 * Measure matches the flow's content measure rather than the marketing width.
 * Chrome that overhangs the content it sits above reads as a different page.
 */
export function ProductShell() {
  const pathname = usePathname();
  const activeIndex = flowIndexFor(pathname);
  const current = activeIndex >= 0 ? FLOW_STEPS[activeIndex] : undefined;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-cloud/85 backdrop-blur-sm">
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="MoveHere home — leave this session"
          className="flex min-h-11 shrink-0 items-center rounded-sm text-navy"
        >
          <Wordmark />
        </Link>

        {current !== undefined && (
          <div className="flex min-w-0 items-center gap-3">
            {/* The current stage, named once, for widths too narrow to label
                every bar. Hidden from assistive tech because FlowProgress
                already announces the same thing per step. */}
            <span
              aria-hidden
              className="truncate text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink lg:hidden"
            >
              {current.label}
            </span>
            <FlowProgress activeIndex={activeIndex} />
          </div>
        )}
      </PageContainer>
    </header>
  );
}
