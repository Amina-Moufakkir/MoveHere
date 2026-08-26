'use client';

import { usePathname } from 'next/navigation';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { ProductShell } from '@/components/shell/product-shell';
import { normalizePath } from '@/components/shell/flow';

/**
 * Which header a route gets.
 *
 * Two surfaces, two jobs. The landing page presents and has destinations; the
 * flow is chrome around a task. This decides between them and owns nothing
 * else — the previous version carried the in-flow markup inline, which is how a
 * broken route comparison stayed invisible inside a component nobody read.
 *
 * The path is normalized here too: `trailingSlash: true` means the landing page
 * arrives as `/` in dev and `/` in the export, but comparing raw strings is the
 * exact mistake this module exists to stop repeating.
 */
export function SiteHeader() {
  const pathname = usePathname();
  return normalizePath(pathname) === '/' ? <MarketingNav /> : <ProductShell />;
}
