/**
 * Temporary route marker.
 *
 * M-Mobile-1 builds the shell only: routing, state, and storage. Each route
 * exists so the navigation graph is real and can be walked, but no parity
 * screen is implemented yet and nothing here is Open Air styling.
 *
 * Every use of this component is deleted as its screen is built.
 */
import { Text, View } from 'react-native';

export function RoutePlaceholder({ route }: { readonly route: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Text style={{ fontSize: 16, fontWeight: '700' }}>{route}</Text>
      <Text style={{ fontSize: 12, color: '#666' }}>Route reachable. Screen not built yet.</Text>
    </View>
  );
}
