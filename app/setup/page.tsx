import type { Metadata } from 'next';
import { SetupClient } from './setup-client';

export const metadata: Metadata = { title: 'Set up the session' };

export default function SetupPage() {
  return <SetupClient />;
}
