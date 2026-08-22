/**
 * A screen that has nothing to show, and says why.
 *
 * Deliberately not styled as a warning. Nothing has gone wrong in any of these
 * cases: MoveHere has simply not been told enough yet, and the action says what
 * would fix that.
 */
import { Text, View } from 'react-native';
import { gutter, space, type, useTheme } from '../theme/tokens';
import { PrimaryAction } from './primary-action';

export function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  readonly title: string;
  readonly body: string;
  readonly action: string;
  readonly onAction: () => void;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.color.cloud,
        justifyContent: 'center',
        paddingHorizontal: gutter,
        gap: space.lg,
      }}
    >
      <Text accessibilityRole="header" style={{ ...type.title, color: t.color.navy }}>
        {title}
      </Text>
      <Text style={{ ...type.lead, color: t.color.navyMuted, maxWidth: 340 }}>{body}</Text>
      <PrimaryAction label={action} onPress={onAction} />
    </View>
  );
}
