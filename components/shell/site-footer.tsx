'use client';

import { usePathname } from 'next/navigation';
import { PageContainer } from '@/components/shell/page-container';
import { NOT_MEDICAL_ADVICE, NO_SAFETY_ASSESSMENT } from '@/src/presentation/safety-copy.ts';

/**
 * The standing boundary statements, on every page.
 *
 * The wording is shared source and is not re-authored per surface (§9). Only
 * the measure changes: the landing page is a wider column, and a footer sitting
 * at the app measure beneath it reads as a misalignment rather than a choice.
 */
export function SiteFooter() {
  const pathname = usePathname();
  return (
    <footer className="border-t border-line py-8 text-sm text-navy-faint">
      <PageContainer
        measure={pathname === '/' ? 'marketing-wide' : 'app'}
        className="flex flex-col gap-2"
      >
        <p>{NOT_MEDICAL_ADVICE}</p>
        <p>{NO_SAFETY_ASSESSMENT}</p>
      </PageContainer>
    </footer>
  );
}
