'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageContainer } from '@/components/shell/page-container';
import { Wordmark } from '@/components/brand/wordmark';

/**
 * Header for a no-auth MVP.
 *
 * There is no account, no settings, and nothing to sign into, so the header
 * carries identity and the current place in the flow — nothing else. Adding a
 * nav bar of destinations a user cannot meaningfully jump between would be
 * borrowed SaaS furniture.
 */
const STEPS = [
  { href: '/park', label: 'Park' },
  { href: '/confirm', label: 'Confirm' },
  { href: '/setup', label: 'Session' },
  { href: '/workout', label: 'Workout' },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((step) => step.href === pathname);
  const inFlow = activeIndex >= 0;

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-cloud/85 backdrop-blur-sm">
      <PageContainer className="flex h-16 max-w-2xl items-center justify-between gap-4">
        <Link href="/" aria-label="MoveHere home" className="text-spruce">
          <Wordmark />
        </Link>

        {inFlow && (
          <nav aria-label="Session progress">
            <ol className="flex items-center gap-1.5">
              {STEPS.map((step, index) => {
                const isCurrent = index === activeIndex;
                const isDone = index < activeIndex;
                return (
                  <li key={step.href}>
                    <Link
                      href={step.href}
                      aria-current={isCurrent ? 'step' : undefined}
                      className="group flex items-center gap-1.5 rounded-[--radius-sm] px-1 py-1"
                    >
                      <span className="sr-only">
                        {step.label}
                        {isCurrent ? ' (current step)' : isDone ? ' (completed)' : ''}
                      </span>
                      <span
                        aria-hidden
                        className={[
                          'block h-1.5 rounded-full transition-all duration-(--duration-settle) ease-(--ease-out-soft)',
                          isCurrent
                            ? 'w-7 bg-persimmon-deep'
                            : isDone
                              ? 'w-3 bg-persimmon-deep-line'
                              : 'w-3 bg-rule-strong group-hover:bg-spruce-faint',
                        ].join(' ')}
                      />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </PageContainer>
    </header>
  );
}
