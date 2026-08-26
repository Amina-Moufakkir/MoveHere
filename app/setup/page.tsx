import type { Metadata } from 'next';
import { SetupClient } from './setup-client';

export const metadata: Metadata = { title: 'Set up your workout' };

export default function SetupPage() {
  return <SetupClient />;
}
