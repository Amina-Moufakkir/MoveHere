import type { Metadata } from 'next';
import { ParkClient } from './park-client';

export const metadata: Metadata = { title: 'What do you see' };

export default function ParkPage() {
  return <ParkClient />;
}
