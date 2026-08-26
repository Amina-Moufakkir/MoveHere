'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/shell/page-container';
import { Wordmark } from '@/components/brand/wordmark';
import { GLYPH_STROKE } from '@/src/presentation/feature-glyphs.ts';

/**
 * The public marketing navigation.
 *
 * Separate from the in-flow header, which carries session progress and nothing
 * else. A landing page has destinations; a session does not.
 *
 * **There is no sign-in control, and its absence is deliberate.** Accounts are
 * PLANNED — intended, and not built (§22). Planned capability does not authorize
 * a production affordance before its minimum truthful functional implementation
 * exists, so there is no Login here: no placeholder, no disabled control, no
 * reserved gap, and no interim route explaining that accounts are unavailable. A
 * disabled Login teaches a reader that accounts exist and are merely switched
 * off, and a route that apologizes for itself is the same claim in prose.
 *
 * The design anchor does show a Login control. That is approved placement for
 * the moment authentication exists, not authority to render one now (§22.3).
 * When Login appears here, it authenticates.
 *
 * The links are in-page anchors into one composition. They are navigation
 * within a single landing page, not a site map — nothing here opens a dialog or
 * routes to a separate marketing page.
 *
 * **About is absent, and that is the smaller of two bad options.** The anchor's
 * composition ends after the benefit row, so an About link would need either a
 * section the anchor does not have or a disclosure widget invented to justify a
 * label. A nav item is not owed a destination; a destination is owed a reason.
 * *Built for parks* survives because it already has one — the Park-First slot in
 * the feature strip is what it describes.
 *
 * The destination named "Built for parks" replaces the design anchor's "For Any
 * Place", which asserts venue awareness in places where none is implemented.
 * The visual direction is approved; the claim is not.
 */
const LINKS = [
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#features', label: 'Features' },
  { href: '#park-first', label: 'Built for parks' },
] as const;

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  /* Escape closes, because a menu that traps a keyboard user is worse than no
     menu. Bound only while open so the page carries no idle listener. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-cloud/90 backdrop-blur-sm">
      <PageContainer measure="marketing-wide" className="flex h-18 items-center justify-between gap-6">
        <Link href="/" aria-label="MoveHere home" className="shrink-0 text-navy">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm text-[0.9375rem] font-bold text-navy-muted transition-colors duration-(--duration-quick) hover:text-navy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/park"
            className="hidden h-11 items-center justify-center rounded-[0.8125rem] bg-park px-5 text-[0.9375rem] font-extrabold text-cloud transition-colors duration-(--duration-quick) hover:bg-park-hover md:inline-flex"
          >
            Get Started
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-park-edge-strong text-navy md:hidden"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5" fill="none" stroke="currentColor" strokeWidth={GLYPH_STROKE.width} strokeLinecap="round">
              {open ? (
                <>
                  <path d="M5 5l14 14" />
                  <path d="M19 5L5 19" />
                </>
              ) : (
                <>
                  <path d="M4 8h16" />
                  <path d="M4 16h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </PageContainer>

      {open && (
        <div id={panelId} className="border-t border-line bg-cloud md:hidden">
          <PageContainer measure="marketing-wide" className="flex flex-col gap-1 py-4">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-lg font-bold text-navy"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/park"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-14 items-center justify-center rounded-[0.875rem] bg-park px-6 text-lg font-extrabold text-cloud"
            >
              Get Started
            </Link>
          </PageContainer>
        </div>
      )}
    </header>
  );
}
