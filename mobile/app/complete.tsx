/**
 * /complete — what was done, then what changed (§6 step 7).
 *
 * Everything above the correction section is read from the snapshot taken when
 * the session finished, never re-derived from current venue state. That is the
 * point of the snapshot: correcting a feature here must not rewrite the workout
 * that was just performed. Without it, marking the bench unusable would make the
 * session you just did describe itself differently — a record quietly rewritten
 * by a later fact.
 *
 * So there are two different truths on this screen, deliberately:
 *
 *   · the completion summary — immutable, past tense, what happened;
 *   · the venue inventory — live, present tense, what is true now.
 *
 * Corrections act only on the second. They go through applyCorrection, which
 * can withdraw or downgrade but has no variant that adds a feature: feedback
 * must never convert an unconfirmed object into a confirmed one.
 *
 * `feature-unusable` keeps the confirmation and marks the feature ineligible.
 * The feature stays in the inventory as venue knowledge (§13) and is excluded
 * from generation by projection rather than removal, which is why the copy says
 * it stays on the park's record either way.
 *
 * Celebrate first. The correction ask comes after, not instead of, the result.
 *
 * "You moved here." is the payoff. The product's whole argument is that you can
 * train where you already are, and this is the one moment it gets to say so.
 * The minutes carry the display size because they are the movement-critical
 * number; the movement count and goal sit under them as supporting detail.
 *
 * The count-up is animation only. The rendered value is always the real one, so
 * a screenshot, a reduced-motion setting, or a screen reader all get 30 rather
 * than whatever frame the animation happened to be on.
 */
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findSupportedFeature } from '../../src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import { byPresentation } from '../../src/presentation/feature-copy.ts';
import { SUBSTITUTE_LABEL } from '../../src/presentation/session-copy.ts';
import { useVenue } from '../components/venue-provider';
import { FeatureGlyph } from '../components/feature-glyph';
import { PrimaryAction } from '../components/primary-action';
import { ProjectContentNote } from '../components/project-content-note';
import { EmptyState } from '../components/empty-state';
import { glyph, gutter, motion, radius, space, touch, type, useTheme } from '../theme/tokens';

/** Count-up on the completion figure. Animation only — never the value. */
function CountUp({ value, style }: { readonly value: number; readonly style: object }) {
  const [shown, setShown] = useState(value);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced) return;
      setShown(0);
      progress.setValue(0);
      const id = progress.addListener(({ value: v }) => setShown(Math.round(v * value)));
      Animated.timing(progress, {
        toValue: 1,
        duration: motion.countUp,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        setShown(value);
        progress.removeListener(id);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [value, progress]);

  return <Text style={style}>{shown}</Text>;
}

export default function CompleteScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { session, inventory, correct, endSession } = useVenue();
  const [corrected, setCorrected] = useState<ReadonlySet<SupportedFeatureId>>(new Set());

  // The snapshot, not the current venue. Past tense.
  const summary = session?.summary ?? null;
  const featuresUsed = (summary?.featuresUsed ?? []) as readonly SupportedFeatureId[];
  const movements = summary?.movements ?? 0;
  const isSubstitute = summary?.wasSubstitute ?? false;

  // The live inventory. Present tense. Only this is correctable.
  const confirmed = [...(inventory?.features ?? [])].sort((a, b) =>
    byPresentation(a.featureId, b.featureId),
  );

  if (session === null || session.completedAt === null) {
    return (
      <EmptyState
        title="Nothing finished yet"
        body="Complete a session and this is where it lands."
        action="Set up a session"
        onAction={() => router.replace('/setup')}
      />
    );
  }

  const mark = (featureId: SupportedFeatureId) => {
    correct({ kind: 'feature-unusable', featureId, occurredAt: new Date().toISOString() });
    setCorrected((prev) => new Set(prev).add(featureId));
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        {/* ---- The payoff ---- */}
        <View style={{ paddingHorizontal: gutter, paddingTop: space.xxl, paddingBottom: space.xl }}>
          <Text style={{ ...type.micro, color: t.color.green, textTransform: 'uppercase' }}>
            Session complete
          </Text>

          <Text
            accessibilityRole="header"
            style={{ ...type.title, color: t.color.navy, marginTop: space.sm }}
          >
            You moved here.
          </Text>

          <View
            accessible
            accessibilityLabel={`${session.minutes} minutes`}
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md, marginTop: space.lg }}
          >
            <CountUp
              value={session.minutes}
              style={{
                ...type.display,
                fontVariant: ['tabular-nums'],
                color: t.color.blueVivid,
              }}
            />
            <Text style={{ ...type.subtitle, color: t.color.navyMuted }}>minutes</Text>
          </View>

          {/* Secondary to the number, by design. */}
          <Text style={{ ...type.label, color: t.color.navyMuted, marginTop: space.md }}>
            {movements} movements · {session.goal[0]!.toUpperCase()}{session.goal.slice(1)}
          </Text>

          {!isSubstitute && featuresUsed.length > 0 && (
            <Text style={{ ...type.label, color: t.color.navyMuted, marginTop: space.lg }}>
              Used in this session
            </Text>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md }}>
            {isSubstitute ? (
              <View
                accessible
                accessibilityLabel={SUBSTITUTE_LABEL}
                style={{
                  borderRadius: radius.pill,
                  borderLeftWidth: 4,
                  borderLeftColor: t.color.yellow,
                  backgroundColor: t.color.pale,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm,
                }}
              >
                <Text style={{ ...type.label, color: t.color.yellowInk }}>{SUBSTITUTE_LABEL}</Text>
              </View>
            ) : (
              featuresUsed.map((id) => {
                const label = findSupportedFeature(id)?.label ?? id;
                return (
                  <View
                    key={id}
                    accessible
                    accessibilityLabel={`Used in this session: ${label}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      borderRadius: radius.pill,
                      backgroundColor: t.color.paleGreen,
                      paddingHorizontal: space.md,
                      paddingVertical: space.sm,
                    }}
                  >
                    <FeatureGlyph id={id} size={glyph.chip} color={t.color.greenInk} />
                    <Text style={{ ...type.label, color: t.color.greenInk }}>{label}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* ---- Then, and only then, the correction ask ---- */}
        {confirmed.length > 0 && (
          <View style={{ borderTopWidth: 1, borderTopColor: t.color.line, paddingTop: space.xl }}>
            <View style={{ paddingHorizontal: gutter }}>
              <Text accessibilityRole="header" style={{ ...type.label, color: t.color.navyMuted }}>
                Anything not usable today?
              </Text>
              <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: space.xs }}>
                Occupied, flooded, fenced off? Say so and MoveHere leaves it out of sessions. It
                stays on your park’s record either way.
              </Text>
            </View>

            <View style={{ marginTop: space.lg, borderTopWidth: 1, borderTopColor: t.color.line }}>
              {confirmed.map((feature) => {
                const unusable = feature.usability.kind === 'reported-unusable';
                const justChanged = corrected.has(feature.featureId);
                const label = findSupportedFeature(feature.featureId)?.label ?? feature.featureId;
                return (
                  <View
                    key={feature.featureId}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.lg,
                      paddingHorizontal: gutter,
                      paddingVertical: space.md,
                      minHeight: touch.action,
                      borderBottomWidth: 1,
                      borderBottomColor: t.color.line,
                    }}
                  >
                    <FeatureGlyph
                      id={feature.featureId}
                      size={glyph.row}
                      color={unusable ? t.color.navyFaint : t.color.green}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          ...type.subtitle,
                          fontSize: 17,
                          color: unusable ? t.color.navyMuted : t.color.navy,
                        }}
                      >
                        {label}
                      </Text>
                      {unusable && (
                        <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: 1 }}>
                          Left out of sessions{justChanged ? ' — saved' : ''}
                        </Text>
                      )}
                    </View>
                    {!unusable && (
                      <Pressable
                        onPress={() => mark(feature.featureId)}
                        accessibilityRole="button"
                        accessibilityLabel={`Mark ${label} not usable today`}
                        accessibilityHint="Leaves it out of future sessions. It stays on your park's record."
                        style={({ pressed }) => ({
                          borderRadius: radius.pill,
                          borderWidth: 1,
                          borderColor: t.color.lineStrong,
                          paddingHorizontal: space.md,
                          minHeight: touch.min,
                          justifyContent: 'center',
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        })}
                      >
                        <Text style={{ ...type.label, color: t.color.navyMuted }}>Not usable</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
        <PrimaryAction
          label="Train again"
          onPress={() => {
            endSession();
            router.replace('/setup');
          }}
        />
        <ProjectContentNote />
      </View>
    </View>
  );
}
