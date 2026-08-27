import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CompleteClient } from './complete-client';

export const metadata: Metadata = { title: 'Session complete' };

/**
 * The recap reads `?r=<recordId>` to reopen a specific completed workout, and
 * `useSearchParams` requires a Suspense boundary to prerender under
 * `output: 'export'`. The fallback is deliberately empty: the client already
 * renders nothing until history has been read, so a spinner here would flash a
 * second loading state in front of the first.
 */
export default function CompletePage() {
  return (
    <Suspense fallback={null}>
      <CompleteClient />
    </Suspense>
  );
}
