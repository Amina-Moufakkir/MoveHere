import { Manrope } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/shell/site-header';
import { PageContainer } from '@/components/shell/page-container';
import './globals.css';

/**
 * Manrope — geometric, open apertures, friendly without being soft. Its heavy
 * weights carry the oversized numerals; its regular weight reads well at small
 * sizes on a phone in daylight. Self-hosted through the Next font pipeline.
 */
const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: {
    default: 'MoveHere — workouts built from the park you already walk past',
    template: '%s · MoveHere',
  },
  description:
    'MoveHere builds a workout from the equipment a nearby park actually has, using only features you have confirmed yourself.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f8fc' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1729' },
  ],
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-spruce focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:uppercase focus:tracking-(--text-marker--letter-spacing) focus:text-chalk"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>

        <footer className="border-t border-rule py-8 text-sm text-spruce-faint">
          <PageContainer className="flex flex-col gap-2">
            <p>MoveHere — exploratory project. Not medical or rehabilitation advice.</p>
            <p>Confirm what is actually there. Nothing here assesses whether it is safe to use.</p>
          </PageContainer>
        </footer>
      </body>
    </html>
  );
}
