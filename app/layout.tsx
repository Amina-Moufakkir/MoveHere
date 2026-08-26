import { Manrope } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/shell/site-header';
import { RouteFocus } from '@/components/shell/route-focus';
import { VenueProvider } from '@/components/venue/venue-provider';
import { SiteFooter } from '@/components/shell/site-footer';
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
    default: 'MoveHere — train with what is actually around you',
    template: '%s · MoveHere',
  },
  description:
    'MoveHere builds a workout from the place you are in, what is actually there, and the time you have. The park is the one environment it understands today, and it uses only the features you confirmed yourself.',
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
        <VenueProvider>
        <RouteFocus />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-navy focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:uppercase focus:tracking-(--text-marker--letter-spacing) focus:text-cloud"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" tabIndex={-1} className="flex flex-1 flex-col">
          {children}
        </main>

        <SiteFooter />
        </VenueProvider>
      </body>
    </html>
  );
}
