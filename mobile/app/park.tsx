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
import { glyph, gutter, radius, space, touch, type, useTheme } from '../theme/tokens';

/** Sorted once at module scope: the order is registry data, not screen state. */
const FEATURES = [...FEATURE_REGISTRY.supported].sort((a, b) => byPresentation(a.id, b.id));

export default function ParkScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { candidates, proposeCandidates } = useVenue();

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

  const tileWidth = (Math.min(width, 560) - gutter * 2 - space.md) / 2;
  const empty = picked.size === 0;

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        <View style={{ paddingHorizontal: gutter, paddingTop: space.xl, paddingBottom: space.xl }}>
          <Text style={{ ...type.micro, color: t.color.blue, textTransform: 'uppercase' }}>
            Step 1 of 3
          </Text>
          <Text
            accessibilityRole="header"
            style={{ ...type.title, color: t.color.navy, marginTop: space.sm }}
          >
            What do you see?
          </Text>
          <Text style={{ ...type.lead, color: t.color.navyMuted, marginTop: space.sm }}>
            Tap anything that’s here. You’ll decide what MoveHere should trust on the next screen.
          </Text>
        </View>

        {/* Candidate selection stays blue: choosing is not yet trusting. */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: space.md,
            paddingHorizontal: gutter,
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
                style={({ pressed }) => ({
                  width: tileWidth,
                  borderRadius: radius.lg,
                  paddingHorizontal: space.lg,
                  paddingTop: space.lg,
                  paddingBottom: space.lg,
                  borderWidth: 1,
                  borderColor: on ? t.color.blue : t.color.line,
                  backgroundColor: on ? t.color.blue : t.color.cloud,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <FeatureGlyph
                  id={feature.id}
                  size={glyph.tile}
                  color={on ? t.color.white : t.color.blue}
                />
                <Text
                  style={{
                    ...type.subtitle,
                    marginTop: space.md,
                    color: on ? t.color.white : t.color.navy,
                  }}
                >
                  {SHORT_LABEL[feature.id]}
                </Text>
                <Text
                  style={{
                    ...type.body,
                    marginTop: 2,
                    color: on ? t.color.white : t.color.navyMuted,
                    opacity: on ? 0.9 : 1,
                  }}
                >
                  {SHORT_HINT[feature.id]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: t.color.line,
          backgroundColor: t.color.cloud,
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
          accessibilityLabel={empty ? 'Pick what you can see' : `Continue with ${picked.size} selected`}
          style={({ pressed }) => [
            {
              minHeight: touch.action,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: empty ? t.color.pale : t.color.blue,
              transform: [{ scale: pressed && !empty ? 0.98 : 1 }],
            },
            empty ? null : t.shadow.lift,
          ]}
        >
          <Text style={{ ...type.action, color: empty ? t.color.navyFaint : t.color.white }}>
            {empty ? 'Pick what you can see' : `Continue with ${picked.size}`}
          </Text>
        </Pressable>
        <Text style={{ ...type.label, fontWeight: '400', color: t.color.navyMuted, textAlign: 'center' }}>
          Nothing is trusted yet. Nothing leaves your phone.
        </Text>
      </View>
    </View>
  );
}
