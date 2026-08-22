/**
 * /setup — session inputs (§6 steps 4-5).
 *
 * Three choices, all drawn from canonical domain sets rather than restated
 * here: durations from SESSION_DURATIONS, goals from SESSION_GOALS, conditions
 * from REPORTED_CONDITIONS. Narrowing any of those in the domain narrows this
 * screen, and a value with no label is a compile error rather than a blank
 * control. The fixed duration set is a product decision (§6 step 4) and is not
 * this screen's to widen.
 *
 * Conditions are **reported, never sensed**. There is no forecast, no location,
 * and no inferred signal — the user says what it is like outside and nothing
 * else is claimed. `assessmentFor` maps "bad out there" to a user-reported
 * cause carrying no signals, precisely because none were collected (§11). "Not
 * sure" is unavailable, which withholds the park for a reason distinguishable
 * from adverse, and is never treated as acceptable.
 *
 * The venue shown here is trusted rehydrated inventory and nothing else. If
 * persisted state failed to rehydrate, that is surfaced rather than smoothed
 * over: a park that could not be read is no park, and the user is told so.
 *
 * No generation happens here. The screen mints a seed, records the request, and
 * hands off — the workout is derived on /workout from the seed and the
 * confirmed inventory, so a reload cannot produce a different session.
 */
import { ScrollView, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findSupportedFeature } from '../../src/domain/feature-registry.ts';
import { SESSION_DURATIONS, SESSION_GOALS } from '../../src/domain/session.ts';
import type { SessionDuration, SessionGoal } from '../../src/domain/session.ts';
import { REPORTED_CONDITIONS } from '../../src/programming/conditions.ts';
import type { ReportedConditions } from '../../src/programming/conditions.ts';
import { useVenue } from '../components/venue-provider';
import { FeatureGlyph, GoalGlyph } from '../components/feature-glyph';
import { PrimaryAction } from '../components/primary-action';
import { glyph, gutter, radius, space, touch, type, useTheme } from '../theme/tokens';
import { makeSeed } from '../../src/programming/seed.ts';

/** Exhaustive by construction: a new goal without copy fails to compile. */
const GOAL_COPY: Record<SessionGoal, { label: string; hint: string }> = {
  strength: { label: 'Strength', hint: 'Fewer movements, more work each' },
  conditioning: { label: 'Conditioning', hint: 'Continuous work, shorter rests' },
};

/** Likewise for conditions. "Not sure" states its consequence outright (§11). */
const CONDITION_COPY: Record<ReportedConditions, { label: string; hint: string }> = {
  acceptable: { label: 'Fine outside', hint: 'Good to train in the park' },
  adverse: { label: 'Bad out there', hint: 'Rain, ice, heat or dark' },
  unknown: { label: 'Not sure', hint: 'Treated the same as bad conditions' },
};

export default function SetupScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { inventory, loadOutcome, request, setRequest, startSession } = useVenue();

  const usable = (inventory?.features ?? []).filter((f) => f.usability.kind === 'usable');
  const venueBlind = request.conditions !== 'acceptable' || usable.length === 0;

  const sectionLabel = { ...type.label, color: t.color.navyMuted } as const;

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.section }}>
        <View style={{ paddingHorizontal: gutter, paddingTop: space.xl, paddingBottom: space.xl }}>
          <Text style={{ ...type.micro, color: t.color.blue, textTransform: 'uppercase' }}>
            Step 3 of 3
          </Text>
          <Text
            accessibilityRole="header"
            style={{ ...type.title, color: t.color.navy, marginTop: space.sm }}
          >
            How long have you got?
          </Text>

          {/* Confirmed venue, carried forward. Green: trusted environment. */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg }}>
            {loadOutcome?.kind === 'unusable' && (
              <View style={{ borderRadius: radius.pill, backgroundColor: t.color.pale, paddingHorizontal: space.md, paddingVertical: space.sm }}>
                <Text style={{ ...type.label, color: t.color.navyMuted }}>
                  Saved park data couldn’t be read — confirm again
                </Text>
              </View>
            )}
            {usable.length === 0 ? (
              <View style={{ borderRadius: radius.pill, backgroundColor: t.color.pale, paddingHorizontal: space.md, paddingVertical: space.sm }}>
                <Text style={{ ...type.label, color: t.color.navyMuted }}>
                  No park confirmed — no-equipment session
                </Text>
              </View>
            ) : (
              usable.map((f) => {
                const label = findSupportedFeature(f.featureId)?.label ?? f.featureId;
                return (
                  <View
                    key={f.featureId}
                    accessible
                    accessibilityLabel={`Confirmed: ${label}`}
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
                    <FeatureGlyph id={f.featureId} size={glyph.chip} color={t.color.greenInk} />
                    <Text style={{ ...type.label, color: t.color.greenInk }}>{label}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: gutter, gap: space.section }}>
          {/* ---- Minutes: duration is movement-critical, so it gets scale ---- */}
          <View>
            <Text style={sectionLabel}>Minutes</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Session length in minutes"
              style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}
            >
              {SESSION_DURATIONS.map((minutes: SessionDuration) => {
                const on = request.minutes === minutes;
                return (
                  <Pressable
                    key={minutes}
                    onPress={() => setRequest({ minutes })}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, selected: on }}
                    accessibilityLabel={`${minutes} minutes`}
                    style={({ pressed }) => ({
                      flex: 1,
                      borderRadius: radius.lg,
                      alignItems: 'center',
                      paddingVertical: space.md,
                      borderWidth: 1,
                      borderColor: on ? t.color.blue : t.color.line,
                      backgroundColor: on ? t.color.blue : t.color.cloud,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <Text
                      style={{
                        ...type.displaySm,
                        fontVariant: ['tabular-nums'],
                        color: on ? t.color.white : t.color.navy,
                      }}
                    >
                      {minutes}
                    </Text>
                    <Text
                      style={{
                        ...type.micro,
                        textTransform: 'uppercase',
                        color: on ? t.color.white : t.color.navyFaint,
                      }}
                    >
                      min
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ---- Focus ---- */}
          <View>
            <Text style={sectionLabel}>Focus</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Session focus"
              style={{ flexDirection: 'row', gap: space.sm, marginTop: space.md }}
            >
              {SESSION_GOALS.map((goal: SessionGoal) => {
                const on = request.goal === goal;
                const copy = GOAL_COPY[goal];
                return (
                  <Pressable
                    key={goal}
                    onPress={() => setRequest({ goal })}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, selected: on }}
                    accessibilityLabel={`${copy.label}. ${copy.hint}`}
                    style={({ pressed }) => ({
                      flex: 1,
                      borderRadius: radius.lg,
                      padding: space.lg,
                      gap: space.xs,
                      borderWidth: 1,
                      borderColor: on ? t.color.blue : t.color.line,
                      backgroundColor: on ? t.color.blue : t.color.cloud,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <GoalGlyph
                      goal={goal}
                      size={glyph.row}
                      color={on ? t.color.white : t.color.blue}
                      surface={on ? t.color.blue : t.color.cloud}
                    />
                    <Text
                      style={{
                        ...type.subtitle,
                        marginTop: space.xs,
                        color: on ? t.color.white : t.color.navy,
                      }}
                    >
                      {copy.label}
                    </Text>
                    <Text
                      style={{
                        ...type.body,
                        color: on ? t.color.white : t.color.navyMuted,
                        opacity: on ? 0.9 : 1,
                      }}
                    >
                      {copy.hint}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ---- Conditions: rows on the canvas, hairline separated ---- */}
          <View>
            <Text style={sectionLabel}>Conditions outside</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Conditions outside, as you report them"
              style={{ marginTop: space.md, borderTopWidth: 1, borderTopColor: t.color.line }}
            >
              {REPORTED_CONDITIONS.map((value: ReportedConditions) => {
                const on = request.conditions === value;
                const copy = CONDITION_COPY[value];
                return (
                  <Pressable
                    key={value}
                    onPress={() => setRequest({ conditions: value })}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on, selected: on }}
                    accessibilityLabel={`${copy.label}. ${copy.hint}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: space.md,
                      minHeight: touch.action,
                      paddingVertical: space.md,
                      borderBottomWidth: 1,
                      borderBottomColor: t.color.line,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ ...type.subtitle, fontSize: 17, color: on ? t.color.blue : t.color.navy }}>
                        {copy.label}
                      </Text>
                      <Text style={{ ...type.body, marginTop: 1, color: t.color.navyMuted }}>
                        {copy.hint}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: radius.pill,
                        borderWidth: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: on ? t.color.blue : t.color.lineStrong,
                      }}
                    >
                      {on && (
                        <View
                          style={{ width: 11, height: 11, borderRadius: radius.pill, backgroundColor: t.color.blue }}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
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
        {/* Which path this will take, before it is taken (§11). */}
        <Text
          accessibilityLiveRegion="polite"
          style={{
            ...type.label,
            textAlign: 'center',
            color: venueBlind ? t.color.yellowInk : t.color.greenInk,
          }}
        >
          {venueBlind
            ? 'This will be a no-equipment session, not a park session'
            : `A park session using ${usable.length} confirmed ${usable.length === 1 ? 'feature' : 'features'}`}
        </Text>

        <PrimaryAction
          label="Build the session"
          onPress={() => {
            startSession(makeSeed(Date.now()));
            router.push('/workout');
          }}
        />
      </View>
    </View>
  );
}
