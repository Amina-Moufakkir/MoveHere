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
import { FeatureGlyph } from '../components/feature-glyph';
import { radius, space, touch, type, useTheme } from '../theme/tokens';

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

/**
 * Provenance, not a control (§6 step 6).
 *
 * Same shape as the web client's, including the fallback: the seed only has to
 * vary between sessions, so a clock-derived value is sufficient where
 * randomUUID is unavailable.
 */
const newSeed = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `s-${Date.now()}`;

export default function SetupScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { inventory, loadOutcome, request, setRequest, startSession } = useVenue();

  const usable = (inventory?.features ?? []).filter((f) => f.usability.kind === 'usable');
  const venueBlind = request.conditions !== 'acceptable' || usable.length === 0;

  const sectionLabel = {
    ...type.marker,
    color: t.color.navyMuted,
    textTransform: 'uppercase',
  } as const;

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
            Step 3 of 3 · Set up
          </Text>
          <Text
            accessibilityRole="header"
            style={{ ...type.page, color: t.color.navy, marginTop: space.md }}
          >
            How long have you got?
          </Text>

          {/* What was confirmed, carried forward so the choice has context. */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg }}>
            {loadOutcome?.kind === 'unusable' && (
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
                <Text style={{ fontSize: 13, fontWeight: '600', color: t.color.navyMuted }}>
                  Saved park data couldn’t be read — confirm again
                </Text>
              </View>
            )}

            {usable.length === 0 ? (
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
                <Text style={{ fontSize: 13, fontWeight: '600', color: t.color.navyMuted }}>
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
                    <FeatureGlyph id={f.featureId} size={16} color={t.color.greenInk} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.greenInk }}>
                      {label}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View style={{ paddingHorizontal: space.lg, paddingTop: space.xl, gap: space.xxl }}>
          {/* ---- Minutes ---- */}
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
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        paddingVertical: space.xl,
                        backgroundColor: on ? t.color.blue : t.color.white,
                        transform: [{ scale: pressed ? 0.98 : 1 }],
                      },
                      on ? t.shadow.raise : t.shadow.lift,
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        fontWeight: '800',
                        letterSpacing: -1.1,
                        fontVariant: ['tabular-nums'],
                        color: on ? t.color.white : t.color.navy,
                      }}
                    >
                      {minutes}
                    </Text>
                    <Text
                      style={{
                        ...type.marker,
                        marginTop: 2,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                        color: on ? t.color.white : t.color.navy,
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
                    style={({ pressed }) => [
                      {
                        flex: 1,
                        borderRadius: radius.md,
                        padding: space.lg,
                        gap: space.xs,
                        backgroundColor: on ? t.color.blue : t.color.white,
                        transform: [{ scale: pressed ? 0.985 : 1 }],
                      },
                      on ? t.shadow.raise : t.shadow.lift,
                    ]}
                  >
                    <Text style={{ ...type.tileLabel, color: on ? t.color.white : t.color.navy }}>
                      {copy.label}
                    </Text>
                    <Text
                      style={{
                        ...type.tileHint,
                        opacity: 0.75,
                        color: on ? t.color.white : t.color.navyMuted,
                      }}
                    >
                      {copy.hint}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ---- Conditions ---- */}
          <View>
            <Text style={sectionLabel}>Conditions outside</Text>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Conditions outside, as you report them"
              style={{ gap: space.sm, marginTop: space.md }}
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
                    style={({ pressed }) => [
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: space.md,
                        borderRadius: radius.md,
                        minHeight: touch.min,
                        paddingHorizontal: space.lg,
                        paddingVertical: space.md,
                        backgroundColor: on ? t.color.blue : t.color.white,
                        transform: [{ scale: pressed ? 0.99 : 1 }],
                      },
                      t.shadow.lift,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '800',
                          color: on ? t.color.white : t.color.navy,
                        }}
                      >
                        {copy.label}
                      </Text>
                      <Text
                        style={{
                          ...type.tileHint,
                          marginTop: 2,
                          opacity: 0.75,
                          color: on ? t.color.white : t.color.navyMuted,
                        }}
                      >
                        {copy.hint}
                      </Text>
                    </View>
                    {/* Filled when chosen. The web leaves this ring empty and
                        relies on the row fill alone, which reads as unselected
                        at a glance; a radio that looks empty when it is on is
                        worth diverging over. */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: radius.pill,
                        borderWidth: 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: on ? t.color.white : t.color.lineStrong,
                      }}
                    >
                      {on && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: radius.pill,
                            backgroundColor: t.color.white,
                          }}
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
          backgroundColor: t.color.white,
          paddingHorizontal: space.lg,
          paddingTop: space.lg,
          paddingBottom: Math.max(insets.bottom, space.lg),
          gap: space.md,
        }}
      >
        {/* Which path this will take, before it is taken. A substitute is never
            presented as a park session (§11). */}
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center',
            color: t.color.navyMuted,
          }}
        >
          {venueBlind
            ? 'This will be a no-equipment session, not a park session'
            : `A park session using ${usable.length} confirmed ${usable.length === 1 ? 'feature' : 'features'}`}
        </Text>

        <Pressable
          onPress={() => {
            // A seed is minted here, once, and persisted with the session.
            startSession(newSeed());
            router.push('/workout');
          }}
          accessibilityRole="button"
          accessibilityLabel="Build the session"
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
          <Text style={{ ...type.action, color: t.color.white }}>Build the session</Text>
        </Pressable>
      </View>
    </View>
  );
}
