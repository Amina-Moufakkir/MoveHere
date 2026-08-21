import type { Metadata } from 'next';
import { CompleteClient } from './complete-client';

export const metadata: Metadata = { title: 'Session complete' };

export default function CompletePage() {
  return <CompleteClient />;
}
