/**
 * Native app shell.
 *
 * VenueProvider wraps the whole navigator for the same reason it wraps the web
 * app's body: venue and session state outlive any single screen, and the
 * confirmed inventory a workout derives from must not be re-read per route.
 *
 * The route names deliberately match the web client's paths one for one, so the
 * two clients describe the same flow in the same words:
 *
 *     /  ·  /park  ·  /confirm  ·  /setup  ·  /workout  ·  /complete
 *
 * Header styling is left at the platform default. Open Air is a later
 * milestone, and a half-applied identity reads worse than none.
 */
import { Stack } from 'expo-router';
import { VenueProvider } from '../components/venue-provider';

export default function RootLayout() {
  return (
    <VenueProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'MoveHere' }} />
        <Stack.Screen name="park" options={{ title: 'Look around' }} />
        <Stack.Screen name="confirm" options={{ title: 'Confirm' }} />
        <Stack.Screen name="setup" options={{ title: 'Set up' }} />
        <Stack.Screen name="workout" options={{ title: 'Your session' }} />
        <Stack.Screen name="complete" options={{ title: 'Done' }} />
      </Stack>
    </VenueProvider>
  );
}
