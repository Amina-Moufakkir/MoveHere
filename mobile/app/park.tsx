/**
 * /park — the first parity screen.
 *
 * Behaviour is the web client's, reproduced against the same shared source: the
 * same registry, the same presentation order, the same labels and hints, the
 * same candidate construction. Nothing about what a feature is, what it is
 * called, or what order it appears in is decided here.
 *
 * The invariant this screen exists inside: **tapping creates nothing.** A tap
 * changes local selection only. Continue turns the selection into candidates,
 * and a candidate is a proposal — not venue state, not confirmed inventory, and
 * not something generation may read (§6 steps 2-3). Confirmation happens on the
 * next screen and nowhere else. Selection is not persisted either: leaving
 * loses it, deliberately, because a proposal that survives a restart starts to
 * look like a decision the user made.
 *
 * Native rather than web-shaped: Pressable with accessibilityRole="checkbox"
 * and accessibilityState, so VoiceOver announces each tile as a checkbox with
 * its own checked state rather than as a styled label wrapping a hidden input.
 */
import { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import { SHORT_HINT, SHORT_LABEL, byPresentation } from '../../src/presentation/feature-copy.ts';
import { useVenue } from '../components/venue-provider';
import { CheckGlyph, FeatureGlyph } from '../components/feature-glyph';
import { radius, space, touch, type, useTheme } from '../theme/tokens';

/** Sorted once at module scope: the order is registry data, not screen state. */
const FEATURES = [...FEATURE_REGISTRY.supported].sort((a, b) => byPresentation(a.id, b.id));

export default function ParkScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { candidates, proposeCandidates } = useVenue();

  // Seeded from candidates so returning from /confirm shows what was proposed.
  const [picked, setPicked] = useState<ReadonlySet<SupportedFeatureId>>(
    () => new Set(candidates.map((c) => c.featureId)),
  );

  const toggle = (id: SupportedFeatureId) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onContinue = () => {
    // Selecting produces candidates. Nothing here creates venue state.
    proposeCandidates([...picked]);
    router.push('/confirm');
  };

  // Two columns, thumb-reachable. Wider devices get roomier tiles, not more.
  const gutter = space.lg;
  const tileWidth = (Math.min(width, 560) - gutter * 3) / 2;
  const empty = picked.size === 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={{ backgroundColor: t.color.pale, paddingHorizontal: gutter, paddingTop: space.xxl, paddingBottom: space.xl }}>
          <Text style={{ ...type.marker, color: t.color.blueInk, textTransform: 'uppercase' }}>
            Step 1 of 3 · Look around
          </Text>
          <Text
            accessibilityRole="header"
            style={{ ...type.page, color: t.color.navy, marginTop: space.md }}
          >
            What do you see?
          </Text>
          <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: space.md, maxWidth: 340 }}>
            Tap anything that’s here. You’ll decide what MoveHere should trust on the next screen.
          </Text>
        </View>

        {/* No grouping role on the container. The web uses a fieldset/legend,
            which React Native has no equivalent of, and a label on a
            non-accessible View is metadata VoiceOver never reads. The heading
            above provides the context; each tile carries its own label, hint,
            and checked state. */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: gutter,
            paddingHorizontal: gutter,
            paddingTop: space.xl,
          }}
        >
          {FEATURES.map((feature) => {
            const on = picked.has(feature.id);
            return (
              <Pressable
                key={feature.id}
                onPress={() => toggle(feature.id)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={SHORT_LABEL[feature.id]}
                accessibilityHint={SHORT_HINT[feature.id]}
                style={({ pressed }) => [
                  {
                    width: tileWidth,
                    minHeight: 148,
                    borderRadius: radius.md,
                    padding: space.lg,
                    justifyContent: 'space-between',
                    backgroundColor: on ? t.color.greenDeep : t.color.white,
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                  },
                  on ? t.shadow.raise : t.shadow.lift,
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: radius.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? 'rgba(255,255,255,0.2)' : t.color.pale,
                    }}
                  >
                    <FeatureGlyph
                      id={feature.id}
                      size={32}
                      color={on ? t.color.white : t.color.blueInk}
                    />
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: radius.pill,
                      borderWidth: 2,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: space.xs,
                      borderColor: on ? t.color.white : t.color.lineStrong,
                      backgroundColor: on ? t.color.white : 'transparent',
                    }}
                  >
                    {on && <CheckGlyph size={16} color={t.color.greenDeep} />}
                  </View>
                </View>

                <View style={{ marginTop: space.md }}>
                  <Text style={{ ...type.tileLabel, color: on ? t.color.white : t.color.navy }}>
                    {SHORT_LABEL[feature.id]}
                  </Text>
                  <Text
                    style={{
                      ...type.tileHint,
                      marginTop: 2,
                      color: on ? t.color.white : t.color.navyMuted,
                      opacity: on ? 0.85 : 1,
                    }}
                  >
                    {SHORT_HINT[feature.id]}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: t.color.line,
          backgroundColor: t.color.white,
          paddingHorizontal: gutter,
          paddingTop: space.lg,
          paddingBottom: Math.max(insets.bottom, space.lg),
          gap: space.md,
        }}
      >
        <Pressable
          onPress={onContinue}
          disabled={empty}
          accessibilityRole="button"
          accessibilityState={{ disabled: empty }}
          accessibilityLabel={
            empty ? 'Pick what you can see' : `Continue with ${picked.size} selected`
          }
          style={({ pressed }) => [
            {
              minHeight: touch.action,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: space.xxl,
              backgroundColor: t.color.blue,
              opacity: empty ? 0.45 : 1,
              transform: [{ scale: pressed && !empty ? 0.98 : 1 }],
            },
            empty ? null : t.shadow.lift,
          ]}
        >
          {/* The `white` token, not literal white: it inverts to deep navy in dark
              mode, where the blue fill lightens. Hardcoding #fff here measured about
              2.2:1 against the dark-mode fill. */}
          <Text style={{ ...type.action, color: t.color.white }}>
            {empty ? 'Pick what you can see' : `Continue with ${picked.size}`}
          </Text>
        </Pressable>
        <Text style={{ ...type.tileHint, color: t.color.navyMuted, textAlign: 'center' }}>
          Nothing is trusted yet. Nothing leaves your phone.
        </Text>
      </View>
    </View>
  );
}
