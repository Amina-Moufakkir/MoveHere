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
/** A soft rim, not a second capsule around the first. */
const TRACK = 4;
/**
 * The control hugs its label rather than filling the footer.
 *
 * A full-width capsule puts most of its area either side of the word, which
 * reads as a bar across the bottom of the screen. Sized to the label with a
 * floor, "Done" becomes a compact object you press and a longer label still
 * grows to fit.
 */
const PAD_X = 40;
const MIN_WIDTH = 190;
const CHECK_SIZE = 31;

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
        alignSelf: 'center',
        maxWidth: '100%',
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
          minWidth: MIN_WIDTH,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: PAD_X,
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
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        ) : (
          <Text
            numberOfLines={1}
            style={{ fontSize: 20, lineHeight: 24, fontWeight: '800', color: labelColor }}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
