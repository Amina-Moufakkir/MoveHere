/**
 * Project-content provenance label (§8).
 *
 * Wording is shared with the web client. This owns only how it looks:
 * persistent but quiet, the register of a caption. Not a warning.
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
          width: 5,
          height: 5,
          borderRadius: 3,
          marginTop: 6,
          backgroundColor: t.color.navyFaint,
        }}
      />
      <Text style={{ flex: 1, fontSize: 12, lineHeight: 16, color: t.color.navyFaint }}>
        {PROJECT_CONTENT_NOTE}
      </Text>
    </View>
  );
}
