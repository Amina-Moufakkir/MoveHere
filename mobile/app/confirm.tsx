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
import { EmptyState } from '../components/empty-state';
import { glyph, gutter, radius, space, touch, type, useTheme } from '../theme/tokens';

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

  const [decisions, setDecisions] = useState<ReadonlyMap<SupportedFeatureId, ConfirmationDecision>>(
    () => new Map(),
  );

  const ordered = useMemo(
    () => [...candidates].sort((a, b) => byPresentation(a.featureId, b.featureId)),
    [candidates],
  );

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
      <EmptyState
        title="Nothing to confirm yet"
        body="Tell MoveHere what you can see first. Confirmation is the only way a feature enters your park."
        action="Look around"
        onAction={() => router.replace('/park')}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        <View style={{ paddingHorizontal: gutter, paddingTop: space.xl, paddingBottom: space.xl }}>
          <Text style={{ ...type.micro, color: t.color.blue, textTransform: 'uppercase' }}>
            Step 2 of 3
          </Text>
          <Text
            accessibilityRole="header"
            style={{ ...type.title, color: t.color.navy, marginTop: space.sm }}
          >
            What should MoveHere trust?
          </Text>
          <Text style={{ ...type.lead, color: t.color.navyMuted, marginTop: space.sm }}>
            Only what you confirm here is used to build a session. If you’re not certain something
            is usable, say so — it costs you options, not a wasted trip.
          </Text>
        </View>

        {ordered.map((candidate) => {
          const feature = findSupportedFeature(candidate.featureId);
          const name = feature?.label ?? candidate.featureId;
          const answered = decisions.get(candidate.featureId);
          const isTrusted = effective(candidate.featureId) === 'present';
          const consequence = consequenceFor(candidate.featureId, isTrusted);

          return (
            <View
              key={candidate.featureId}
              style={{
                paddingHorizontal: gutter,
                paddingVertical: space.lg,
                borderTopWidth: 1,
                borderTopColor: t.color.line,
              }}
            >
              {/* One accessible element: name, question, and consequence
                  together, so a decision is never assembled from fragments. */}
              <View
                accessible
                accessibilityRole="summary"
                accessibilityLabel={[name, feature?.confirmationPrompt, consequence]
                  .filter(Boolean)
                  .join('. ')}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.lg }}
              >
                {/* Trust turns this green. Until then it is neutral. */}
                <FeatureGlyph
                  id={candidate.featureId}
                  size={glyph.row}
                  color={isTrusted ? t.color.green : t.color.navyFaint}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ ...type.subtitle, color: t.color.navy }}>{name}</Text>
                  {feature !== undefined && (
                    <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: 2 }}>
                      {feature.confirmationPrompt}
                    </Text>
                  )}
                  {consequence !== null && (
                    <Text
                      style={{
                        ...type.body,
                        marginTop: space.sm,
                        fontWeight: isTrusted ? '700' : '400',
                        color: isTrusted ? t.color.greenInk : t.color.navyFaint,
                      }}
                    >
                      {consequence}
                    </Text>
                  )}
                </View>
              </View>

              {/* Segmented control: one container, one filled segment. */}
              <View
                accessibilityRole="radiogroup"
                accessibilityLabel={`${name} — is it there?`}
                style={{
                  flexDirection: 'row',
                  marginTop: space.lg,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: t.color.lineStrong,
                  overflow: 'hidden',
                }}
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
                      style={{
                        flex: 1,
                        minHeight: touch.min,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: on
                          ? option.value === 'present'
                            ? t.color.greenDeep
                            : t.color.blue
                          : 'transparent',
                      }}
                    >
                      <Text
                        style={{
                          ...type.label,
                          color: on ? t.color.white : t.color.navyMuted,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {answered === undefined && (
                <Text style={{ ...type.body, marginTop: space.sm, color: t.color.navyFaint }}>
                  Unanswered — counts as {DECISION_LABEL.unsure.toLowerCase()}
                </Text>
              )}
            </View>
          );
        })}
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
        <Text
          accessibilityLiveRegion="polite"
          style={{
            ...type.label,
            textAlign: 'center',
            color: trusted.length === 0 ? t.color.navyMuted : t.color.greenInk,
          }}
        >
          {trusted.length === 0
            ? 'Nothing confirmed — sessions will use no-equipment movements'
            : `${trusted.length} confirmed · ${movementCount} movements available`}
        </Text>

        <Pressable
          onPress={() => {
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
          style={{ alignSelf: 'center', minHeight: touch.min, justifyContent: 'center' }}
        >
          <Text style={{ ...type.label, color: t.color.navyMuted }}>Back to look again</Text>
        </Pressable>
      </View>
    </View>
  );
}
