/**
 * The primary action, everywhere.
 *
 * A compact physical control rather than a full-width web CTA. It is inset well
 * inside the screen gutter so it reads as an object on the canvas instead of a
 * bar spanning the viewport, and it sits in a pale track — a ring of the
 * lightest blue in the palette — which gives it presence without elevation.
 * Daylight takes its depth from colour, so a shadow here would be the one place
 * the identity contradicted itself.
 *
 * 66pt tall, because it is pressed outdoors, one-handed, sometimes mid-effort.
 *
 * `confirming` swaps the label for a large check. That state belongs to the
 * workout player alone: it acknowledges physical work that was actually done.
 * Every other primary action stays a label, because pressing Continue is not an
 * achievement.
 */
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CHECK_PATH, CHECK_VIEWBOX } from '../../src/presentation/feature-glyphs.ts';
import { radius, useTheme } from '../theme/tokens';

/** The button itself, inside its track. */
const HEIGHT = 66;
/** Width of the pale ring. Enough to read as a track, not as a border. */
const TRACK = 6;
/** Inset beyond the screen gutter, so the control does not reach the edges. */
const INSET = 26;
const CHECK_SIZE = 28;

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
  const labelColor = disabled ? t.color.navyFaint : secondary ? t.color.blue : t.color.white;
  const track = disabled || secondary ? 'transparent' : t.color.blueWash;

  return (
    <View
      style={{
        marginHorizontal: INSET,
        padding: TRACK,
        borderRadius: radius.pill,
        backgroundColor: track,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled, busy: confirming }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => ({
          height: HEIGHT,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
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
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        ) : (
          <Text
            numberOfLines={1}
            style={{ fontSize: 18, lineHeight: 22, fontWeight: '800', color: labelColor }}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
