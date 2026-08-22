/**
 * Session progress.
 *
 * A segment fills when its movement is finished — the one animation on this
 * screen that is earned, because something was actually completed. The fill
 * sweeps rather than snapping, at the same pace as the acknowledgement beat, so
 * the check on the action and the segment advancing read as one event.
 *
 * Reduced motion renders the final state immediately. The value is never
 * animated *into* correctness: a segment is drawn complete or not, and the
 * sweep only decorates a transition that has already happened in state.
 */
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import { motion, useTheme } from '../theme/tokens';

function Segment({ state }: { readonly state: 'done' | 'current' | 'todo' }) {
  const t = useTheme();
  const fill = useRef(new Animated.Value(state === 'done' ? 1 : 0)).current;

  useEffect(() => {
    const target = state === 'done' ? 1 : 0;
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        fill.setValue(target);
        return;
      }
      Animated.timing(fill, {
        toValue: target,
        duration: motion.progress,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [state, fill]);

  return (
    <View
      style={{
        height: 4,
        flex: 1,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: state === 'current' ? t.color.blue : t.color.line,
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          borderRadius: 2,
          backgroundColor: t.color.green,
          width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

export function ProgressTrack({
  total,
  done,
  style,
}: {
  readonly total: number;
  readonly done: number;
  readonly style?: object;
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Movements completed"
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={[{ flexDirection: 'row', gap: 3 }, style]}
    >
      {Array.from({ length: total }, (_, i) => (
        <Segment key={i} state={i < done ? 'done' : i === done ? 'current' : 'todo'} />
      ))}
    </View>
  );
}
