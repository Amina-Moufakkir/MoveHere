/**
 * A screen that has nothing to show, and says why.
 *
 * Four of these exist across the flow — no candidates, no session, no session
 * that could be generated, nothing finished yet — and each is a dead end the
 * user reached honestly rather than an error. They were written separately per
 * screen, which is how the same situation starts looking like four different
 * situations.
 *
 * Deliberately not styled as a warning. Nothing has gone wrong: MoveHere has
 * simply not been told enough yet, and the action says what would fix that.
 */
import { Pressable, Text, View } from 'react-native';
import { radius, space, touch, type, useTheme } from '../theme/tokens';

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
        backgroundColor: t.color.pale,
        justifyContent: 'center',
        paddingHorizontal: space.lg,
        gap: space.lg,
      }}
    >
      <Text accessibilityRole="header" style={{ ...type.page, color: t.color.navy }}>
        {title}
      </Text>
      <Text style={{ ...type.body, color: t.color.navyMuted, maxWidth: 340 }}>{body}</Text>
      <Pressable
        onPress={onAction}
        accessibilityRole="button"
        accessibilityLabel={action}
        style={({ pressed }) => [
          {
            alignSelf: 'flex-start',
            minHeight: touch.action,
            justifyContent: 'center',
            paddingHorizontal: space.xxl,
            borderRadius: radius.pill,
            backgroundColor: t.color.blue,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          t.shadow.lift,
        ]}
      >
        <Text style={{ ...type.action, color: t.color.white }}>{action}</Text>
      </Pressable>
    </View>
  );
}
