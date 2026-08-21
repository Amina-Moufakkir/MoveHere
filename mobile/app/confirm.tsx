/**
 * /confirm — the trust boundary, natively.
 *
 * This screen is the only route by which anything becomes venue state. It does
 * not decide what confirmed inventory is; it collects three-way decisions and
 * hands them to the shared contract:
 *
 *     candidates (from /park)  ->  decisions  ->  commitConfirmations
 *         ->  confirmInventory  ->  ConfirmedVenueInventory  ->  persisted
 *
 * What this file may not do, and does not:
 *   · construct venue state — the witnesses are module-local to
 *     src/domain/confirmation.ts, so it could not even by assertion;
 *   · persist candidates or the confirmation log — only the resulting
 *     inventory is written, through the shared native binding;
 *   · invent a candidate. A decision with no matching candidate is reported as
 *     ignored by the contract and never reaches the inventory.
 *
 * One deliberate divergence from the web client, and the reason for it:
 *
 * Web seeds every candidate's decision to 'present', so a user who taps
 * straight through confirms everything. That is a soft yes by default, and
 * §6.3 is explicit that `unsure` is a real outcome rather than a soft yes —
 * precision over recall, because a missed feature costs options while an
 * invented one creates physical risk. Here nothing is pre-selected. An
 * unanswered candidate carries no entry in the decisions map and reaches the
 * contract's own `?? 'unsure'` default, which is the behaviour the invariant
 * describes.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findSupportedFeature } from '../../src/domain/feature-registry.ts';
import type { ConfirmationDecision } from '../../src/domain/confirmation.ts';
import type { SupportedFeatureId } from '../../src/domain/feature.ts';
import { byPresentation } from '../../src/presentation/feature-copy.ts';
import {
  consequenceFor,
  movementCountFor,
} from '../../src/presentation/feature-consequence.ts';
import { useVenue } from '../components/venue-provider';
import { FeatureGlyph } from '../components/feature-glyph';
import { radius, space, touch, type, useTheme } from '../theme/tokens';

const DECISIONS: readonly { value: ConfirmationDecision; label: string }[] = [
  { value: 'present', label: 'Yes' },
  { value: 'unsure', label: 'Not sure' },
  { value: 'absent', label: 'No' },
];

const DECISION_LABEL: Record<ConfirmationDecision, string> = {
  present: 'Yes',
  unsure: 'Not sure',
  absent: 'No',
};

export default function ConfirmScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { candidates, confirm } = useVenue();

  // Starts empty. Absence is meaningful here — see the divergence note above.
  const [decisions, setDecisions] = useState<ReadonlyMap<SupportedFeatureId, ConfirmationDecision>>(
    () => new Map(),
  );

  // Same order as /park, so the review reads as a continuation rather than a
  // reshuffled list of the same things.
  const ordered = useMemo(
    () => [...candidates].sort((a, b) => byPresentation(a.featureId, b.featureId)),
    [candidates],
  );

  /** What the contract will see: an unanswered candidate is unsure. */
  const effective = (id: SupportedFeatureId): ConfirmationDecision =>
    decisions.get(id) ?? 'unsure';

  const trusted = useMemo(
    () => ordered.filter((c) => effective(c.featureId) === 'present'),
    [ordered, decisions],
  );

  const movementCount = useMemo(
    () => movementCountFor(trusted.map((c) => c.featureId)),
    [trusted],
  );

  const set = (id: SupportedFeatureId, value: ConfirmationDecision) =>
    setDecisions((prev) => new Map(prev).set(id, value));

  if (candidates.length === 0) {
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
          Nothing to confirm yet
        </Text>
        <Text style={{ ...type.body, color: t.color.navyMuted, maxWidth: 340 }}>
          Tell MoveHere what you can see first. Confirmation is the only way a feature enters your
          park.
        </Text>
        <Pressable
          onPress={() => router.replace('/park')}
          accessibilityRole="button"
          accessibilityLabel="Look around"
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
          <Text style={{ ...type.action, color: t.color.white }}>Look around</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View
          style={{
            backgroundColor: t.color.pale,
            paddingHorizontal: space.lg,
            paddingTop: space.xxl,
            paddingBottom: space.xl,
          }}
        >
          <Text style={{ ...type.marker, color: t.color.blueInk, textTransform: 'uppercase' }}>
            Step 2 of 3 · Confirm
          </Text>
          <Text
            accessibilityRole="header"
            style={{ ...type.page, color: t.color.navy, marginTop: space.md }}
          >
            What should MoveHere trust?
          </Text>
          <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: space.md, maxWidth: 340 }}>
            Only what you confirm here is used to build a session. If you’re not certain something
            is usable, say so — it costs you options, not a wasted trip.
          </Text>
        </View>

        <View style={{ paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.md }}>
          {ordered.map((candidate) => {
            const feature = findSupportedFeature(candidate.featureId);
            const name = feature?.label ?? candidate.featureId;
            const answered = decisions.get(candidate.featureId);
            const decision = effective(candidate.featureId);
            const isTrusted = decision === 'present';
            const consequence = consequenceFor(candidate.featureId, isTrusted);

            return (
              <View
                key={candidate.featureId}
                style={{
                  borderRadius: radius.md,
                  borderWidth: 1,
                  padding: space.lg,
                  backgroundColor: t.color.white,
                  borderColor: isTrusted ? t.color.greenDeep : t.color.line,
                }}
              >
                {/* The feature reads as one element: name, question, and what
                    trusting it would change. Splitting these across three stops
                    would make a VoiceOver user assemble the decision from
                    fragments. */}
                <View
                  accessible
                  accessibilityRole="summary"
                  accessibilityLabel={[name, feature?.confirmationPrompt, consequence]
                    .filter(Boolean)
                    .join('. ')}
                  style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: radius.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isTrusted ? t.color.paleGreen : t.color.cloudDeep,
                    }}
                  >
                    <FeatureGlyph
                      id={candidate.featureId}
                      size={24}
                      color={isTrusted ? t.color.greenInk : t.color.navyFaint}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ ...type.tileLabel, color: t.color.navy }}>{name}</Text>
                    {feature !== undefined && (
                      <Text style={{ ...type.tileHint, color: t.color.navyMuted, marginTop: 2 }}>
                        {feature.confirmationPrompt}
                      </Text>
                    )}
                    {consequence !== null && (
                      <Text
                        style={{
                          ...type.tileHint,
                          marginTop: space.sm,
                          color: isTrusted ? t.color.greenInk : t.color.navyFaint,
                        }}
                      >
                        {consequence}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Native grouping: a radiogroup naming the feature, with three
                    radios carrying their own checked state. Not a port of the
                    web fieldset, which has no React Native equivalent. */}
                <View
                  accessibilityRole="radiogroup"
                  accessibilityLabel={`${name} — is it there?`}
                  style={{ flexDirection: 'row', gap: space.sm, marginTop: space.lg }}
                >
                  {DECISIONS.map((option) => {
                    const on = answered === option.value;
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => set(candidate.featureId, option.value)}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on, selected: on }}
                        accessibilityLabel={`${option.label}, ${name}`}
                        style={({ pressed }) => ({
                          flex: 1,
                          minHeight: touch.min,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: radius.pill,
                          borderWidth: 1,
                          paddingHorizontal: space.sm,
                          borderColor: on ? 'transparent' : t.color.line,
                          backgroundColor: on ? t.color.blue : t.color.cloud,
                          transform: [{ scale: pressed ? 0.97 : 1 }],
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '700',
                            color: on ? t.color.white : t.color.navy,
                          }}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {answered === undefined && (
                  <Text
                    style={{
                      ...type.tileHint,
                      marginTop: space.sm,
                      color: t.color.navyFaint,
                    }}
                  >
                    Unanswered — counts as {DECISION_LABEL.unsure.toLowerCase()}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
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
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
            color: t.color.navyMuted,
          }}
        >
          {trusted.length === 0
            ? 'Nothing confirmed — sessions will use no-equipment movements'
            : `${trusted.length} confirmed · ${movementCount} movements available`}
        </Text>

        <Pressable
          onPress={() => {
            // The only route into confirmed inventory. The provider persists
            // what the contract returns, and nothing else.
            confirm(decisions);
            router.push('/setup');
          }}
          accessibilityRole="button"
          accessibilityLabel="Confirm and continue"
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
          <Text style={{ ...type.action, color: t.color.white }}>Confirm and continue</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/park')}
          accessibilityRole="button"
          accessibilityLabel="Back to look again"
          style={{ alignSelf: 'center', minHeight: touch.min, justifyContent: 'center', paddingHorizontal: space.lg }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: t.color.navyMuted }}>
            Back to look again
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
