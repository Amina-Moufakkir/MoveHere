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
 * The header is themed rather than left at the platform default. A stock header
 * stays white in dark mode, which put a bright bar above a near-black canvas on
 * every screen.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { VenueProvider } from '../components/venue-provider';
import { type, useTheme } from '../theme/tokens';

export default function RootLayout() {
  const t = useTheme();

  const screenOptions = {
    headerStyle: { backgroundColor: t.color.cloud },
    headerTintColor: t.color.blue,
    headerTitleStyle: { ...type.action, color: t.color.navy },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: t.color.cloud },
  } as const;

  return (
    <VenueProvider>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack screenOptions={screenOptions}>
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
