import type { Metadata } from 'next';
import { WorkoutClient } from './workout-client';

export const metadata: Metadata = { title: 'Your session' };

export default function WorkoutPage() {
  return <WorkoutClient />;
}
