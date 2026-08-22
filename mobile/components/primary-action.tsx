/**
 * The primary action, everywhere.
 *
 * One geometry across the product: a large native capsule, fully rounded, a
 * vivid blue fill and a white high-weight label, with essentially no elevation.
 * Depth in Daylight comes from colour and hairlines, not from shadow, and a
 * raised pill on a white canvas reads as a web button.
 *
 * It is 60pt tall because it is pressed outdoors, one-handed, sometimes
 * mid-effort — well above the 44pt minimum, and sized so the thumb does not
 * have to aim.
 *
 * `confirming` swaps the label for a check mark. That state belongs to the
 * workout player alone: it acknowledges physical work that was actually done.
 * Every other primary action stays a label, because there is nothing to
 * acknowledge — pressing Continue is not an achievement.
 */
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CHECK_PATH, CHECK_VIEWBOX } from '../../src/presentation/feature-glyphs.ts';
import { radius, type, useTheme } from '../theme/tokens';

/** Tuned so the mark reads as an acknowledgement rather than an icon. */
const CHECK_SIZE = 30;

export function PrimaryAction({
  label,
  onPress,
  disabled = false,
  confirming = false,
  accessibilityLabel,
  variant = 'primary',
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly confirming?: boolean;
  readonly accessibilityLabel?: string;
  readonly variant?: 'primary' | 'secondary';
}) {
  const t = useTheme();
  const secondary = variant === 'secondary';

  const fill = disabled ? t.color.pale : secondary ? t.color.cloud : t.color.blue;
  const labelColor = disabled
    ? t.color.navyFaint
    : secondary
      ? t.color.blue
      : t.color.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: confirming }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => ({
        height: 60,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fill,
        borderWidth: secondary ? 1 : 0,
        borderColor: t.color.lineStrong,
        transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
      })}
    >
      {confirming ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Svg width={CHECK_SIZE} height={CHECK_SIZE} viewBox={CHECK_VIEWBOX}>
            <Path
              d={CHECK_PATH}
              fill="none"
              stroke={labelColor}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      ) : (
        <Text style={{ ...type.action, color: labelColor }}>{label}</Text>
      )}
    </Pressable>
  );
}
