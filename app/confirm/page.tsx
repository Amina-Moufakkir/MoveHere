import type { Metadata } from 'next';
import { ConfirmClient } from './confirm-client';

export const metadata: Metadata = { title: 'Confirm what’s available' };

export default function ConfirmPage() {
  return <ConfirmClient />;
}
