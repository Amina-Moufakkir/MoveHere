/**
 * Project-content provenance label (§8).
 *
 * The wording is shared with the web client and lives in
 * src/presentation/safety-copy.ts. This component owns only how it looks:
 * persistent but quiet, the same register as a caption. It stays on screen for
 * the whole session, because a user should never be mid-workout and unaware of
 * what authored the programming. It is not a warning and must not be styled as
 * one.
 */
import { Text, View } from 'react-native';
import { PROJECT_CONTENT_NOTE } from '../../src/presentation/safety-copy.ts';
import { space, useTheme } from '../theme/tokens';

export function ProjectContentNote({ style }: { readonly style?: object }) {
  const t = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }, style]}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginTop: 6,
          backgroundColor: t.color.navyMuted,
          opacity: 0.5,
        }}
      />
      <Text style={{ flex: 1, fontSize: 12, lineHeight: 16, color: t.color.navyMuted }}>
        {PROJECT_CONTENT_NOTE}
      </Text>
    </View>
  );
}
