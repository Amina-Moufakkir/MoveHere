'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Where focus lands after a client-side route change.
 *
 * Next's client navigation swaps the tree without moving focus, so every
 * transition in the flow left the active element on `<body>`. A keyboard user
 * had to traverse the skip link, the wordmark and up to five stage links again
 * on every step, and a screen-reader user was told nothing at all — the page
 * changed silently underneath them.
 *
 * Focus moves to the main landmark rather than to a per-route element. `main`
 * already carries `tabIndex={-1}` and is the target the skip link uses, so the
 * behaviour after a route change and after "skip to content" is the same one.
 * A route-specific strategy would mean a focus rule per screen, and the screen
 * that forgets to implement it is the one that regresses.
 *
 * Deliberately does nothing on first paint. Focusing the landmark on initial
 * load would steal focus from the address bar and re-announce a page the user
 * has only just asked for; the fix is for transitions, which are the thing that
 * was silent.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const main = document.getElementById('main');
    if (main === null) return;
    /* Scroll is handled by the router; focusing must not fight it. */
    main.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
