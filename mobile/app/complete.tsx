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
 */
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findSupportedFeature } from '../../src/domain/feature-registry.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import { byPresentation } from '../../src/presentation/feature-copy.ts';
import { SUBSTITUTE_LABEL } from '../../src/presentation/session-copy.ts';
import { useVenue } from '../components/venue-provider';
import { FeatureGlyph } from '../components/feature-glyph';
import { ProjectContentNote } from '../components/project-content-note';
import { EmptyState } from '../components/empty-state';
import { radius, space, touch, type, useTheme } from '../theme/tokens';

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

  /** Corrections go through applyCorrection. Nothing here touches inventory. */
  const mark = (featureId: SupportedFeatureId) => {
    correct({ kind: 'feature-unusable', featureId, occurredAt: new Date().toISOString() });
    setCorrected((prev) => new Set(prev).add(featureId));
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        {/* ---- Celebrate first ---- */}
        <View
          style={{
            backgroundColor: t.color.pale,
            paddingHorizontal: space.lg,
            paddingTop: space.xxl + space.md,
            paddingBottom: space.xxl,
          }}
        >
          <Text style={{ ...type.marker, color: t.color.greenInk, textTransform: 'uppercase' }}>
            Session complete
          </Text>

          <View
            accessible
            accessibilityLabel={`${session.minutes} minutes, ${movements} movements done`}
            style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md, marginTop: space.md }}
          >
            <Text
              style={{
                fontSize: 76,
                lineHeight: 76,
                fontWeight: '800',
                letterSpacing: -3,
                fontVariant: ['tabular-nums'],
                color: t.color.blueInk,
              }}
            >
              {session.minutes}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: t.color.navyMuted }}>
              minutes
            </Text>
          </View>

          <Text
            accessibilityRole="header"
            style={{ ...type.page, color: t.color.navy, marginTop: space.lg }}
          >
            {movements} movements done.{isSubstitute ? ' No equipment needed.' : ''}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg }}>
            <View
              style={[
                {
                  borderRadius: radius.pill,
                  backgroundColor: t.color.white,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm,
                },
                t.shadow.lift,
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  color: t.color.navyMuted,
                }}
              >
                {session.goal}
              </Text>
            </View>

            {isSubstitute && (
              <View
                accessible
                accessibilityLabel={SUBSTITUTE_LABEL}
                style={[
                  {
                    borderRadius: radius.pill,
                    borderLeftWidth: 4,
                    borderLeftColor: t.color.yellow,
                    backgroundColor: t.color.white,
                    paddingHorizontal: space.md,
                    paddingVertical: space.sm,
                  },
                  t.shadow.lift,
                ]}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.yellowInk }}>
                  {SUBSTITUTE_LABEL}
                </Text>
              </View>
            )}
          </View>

          {/* Named explicitly, and in the past tense. These are what the finished
              session actually relied on — not what the park currently holds. */}
          {!isSubstitute && featuresUsed.length > 0 && (
            <View style={{ marginTop: space.xl }}>
              <Text style={{ ...type.marker, color: t.color.navyMuted, textTransform: 'uppercase' }}>
                Used in this session
              </Text>
              <View
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md }}
              >
                {featuresUsed.map((id) => {
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
                      <FeatureGlyph id={id} size={16} color={t.color.greenInk} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.greenInk }}>
                        {label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ---- Then, and only then, the correction ask ---- */}
        {confirmed.length > 0 && (
          <View style={{ paddingHorizontal: space.lg, paddingTop: space.xl }}>
            <Text
              accessibilityRole="header"
              style={{ ...type.marker, color: t.color.navyMuted, textTransform: 'uppercase' }}
            >
              Anything not usable today?
            </Text>
            <Text
              style={{ ...type.tileHint, color: t.color.navyMuted, marginTop: space.sm, maxWidth: 340 }}
            >
              Occupied, flooded, fenced off? Say so and MoveHere leaves it out of sessions. It stays
              on your park’s record either way.
            </Text>

            <View style={{ marginTop: space.lg, gap: space.sm }}>
              {confirmed.map((feature) => {
                const unusable = feature.usability.kind === 'reported-unusable';
                const justChanged = corrected.has(feature.featureId);
                const label = findSupportedFeature(feature.featureId)?.label ?? feature.featureId;
                return (
                  <View
                    key={feature.featureId}
                    style={[
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: space.md,
                        borderRadius: radius.md,
                        paddingHorizontal: space.lg,
                        paddingVertical: space.md,
                        minHeight: touch.min,
                        backgroundColor: unusable ? t.color.cloudDeep : t.color.white,
                      },
                      unusable ? null : t.shadow.lift,
                    ]}
                  >
                    <FeatureGlyph
                      id={feature.featureId}
                      size={24}
                      color={unusable ? t.color.navyFaint : t.color.blueInk}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '800',
                          color: unusable ? t.color.navyMuted : t.color.navy,
                        }}
                      >
                        {label}
                      </Text>
                      {unusable && (
                        <Text style={{ ...type.tileHint, color: t.color.navyMuted, marginTop: 2 }}>
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
                          borderColor: t.color.line,
                          paddingHorizontal: space.md,
                          minHeight: touch.min,
                          justifyContent: 'center',
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        })}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.navyMuted }}>
                          Not usable
                        </Text>
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
          backgroundColor: t.color.white,
          paddingHorizontal: space.lg,
          paddingTop: space.lg,
          paddingBottom: Math.max(insets.bottom, space.lg),
          gap: space.md,
        }}
      >
        <Pressable
          onPress={() => {
            endSession();
            router.replace('/setup');
          }}
          accessibilityRole="button"
          accessibilityLabel="Train again"
          style={({ pressed }) => [
            {
              minHeight: touch.action,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.color.blue,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
            t.shadow.lift,
          ]}
        >
          <Text style={{ ...type.action, color: t.color.white }}>Train again</Text>
        </Pressable>
        <ProjectContentNote />
      </View>
    </View>
  );
}
