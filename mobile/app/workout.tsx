/**
 * /workout — the real generator, on the device.
 *
 * Nothing about the session is decided here. The provider holds the persisted
 * request and rehydrated inventory; generateFor assembles the input and calls
 * generateSession. This screen renders what comes back.
 *
 *     persisted seed + rehydrated inventory + request
 *         -> assessConditions -> selectPolicy(FeasibleProgramming)
 *         -> generateSession -> blocks / items / provenance
 *
 * The session is never stored. It is regenerated from the seed and the confirmed
 * inventory every time this screen mounts, which is what makes a reload return
 * the same workout rather than a plausible-looking different one — and what
 * stops a stored session drifting from the content that produced it. Only
 * progress, the request, and the seed persist.
 *
 * Every item carries a SelectionBasis, and the badge shows it: a confirmed
 * feature names the feature it relied on, an environment-independent movement
 * says so. There is no third state, because an item with no auditable basis
 * cannot be constructed (§6 step 6).
 *
 * A substitute is never dressed up as a park session (§11) — the label and the
 * reason both come from shared source.
 *
 * No timers, no keep-awake, no haptics. Advancing is a tap, as on the web.
 */
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findSupportedFeature } from '../../src/domain/feature-registry.ts';
import { exerciseCues, exerciseName } from '../../src/programming/session-builder.ts';
import { SUBSTITUTE_LABEL, SUBSTITUTE_REASON } from '../../src/presentation/session-copy.ts';
import {
  doseParts,
  doseText,
  isSingleEffort,
} from '../../src/presentation/prescription-copy.ts';
import { useVenue } from '../components/venue-provider';
import { ProjectContentNote } from '../components/project-content-note';
import { EmptyState } from '../components/empty-state';
import { makeSeed } from '../../src/programming/seed.ts';
import { radius, space, touch, type, useTheme } from '../theme/tokens';

export default function WorkoutScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { session, workout, setDone, completeSession, startSession } = useVenue();

  const items = useMemo(
    () =>
      workout !== null && workout.kind !== 'not-generated'
        ? workout.blocks.flatMap((b) => b.items.map((item) => ({ block: b.name, item })))
        : [],
    [workout],
  );

  if (session === null || workout === null) {
    return (
      <EmptyState
        title="No session yet"
        body="Choose how long you have and MoveHere will build one."
        action="Set up a session"
        onAction={() => router.replace('/setup')}
      />
    );
  }

  if (workout.kind === 'not-generated') {
    return (
      <EmptyState
        title="Couldn’t build a session"
        body={
          workout.reason === 'insufficient-time'
            ? 'There isn’t enough time for a full session at this length.'
            : 'No movements are available. This is a content problem, not something you did.'
        }
        action="Change the session"
        onAction={() => router.replace('/setup')}
      />
    );
  }

  const total = items.length;
  const done = Math.min(session.done, total);
  const current = items[Math.min(done, total - 1)];
  const isSubstitute = workout.kind === 'substitute-session';
  const finished = done >= total;

  const advance = () => {
    if (done + 1 >= total) {
      setDone(total);
      completeSession(new Date().toISOString(), {
        movements: total,
        featuresUsed: workout.kind === 'park-session' ? [...workout.featuresUsed] : [],
        wasSubstitute: workout.kind === 'substitute-session',
      });
      router.push('/complete');
      return;
    }
    setDone(done + 1);
  };

  const basis = current?.item.basis;
  const featureLabel =
    basis?.kind === 'confirmed-feature'
      ? (findSupportedFeature(basis.featureId)?.label ?? basis.featureId)
      : null;
  const parts = current === undefined ? (['', ''] as const) : doseParts(current.item.prescription);
  const [big, small] = parts;
  const cues = current === undefined ? [] : exerciseCues(current.item.exerciseId);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: space.xl }}>
        {/* Progress derived from the generated items, never from a stored count
            of what a session was expected to contain. */}
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Movements completed"
          accessibilityValue={{ min: 0, max: total, now: done }}
          style={{ flexDirection: 'row', gap: 5 }}
        >
          {items.map((entry, i) => (
            <View
              key={`${entry.item.exerciseId}-${i}`}
              style={{
                height: 6,
                flex: 1,
                borderRadius: 3,
                backgroundColor:
                  i < done ? t.color.green : i === done ? t.color.blue : t.color.lineStrong,
                opacity: i > done ? 0.6 : 1,
              }}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginTop: space.md,
            gap: space.md,
          }}
        >
          <Text style={{ ...type.marker, color: t.color.blueInk, textTransform: 'uppercase' }}>
            Movement {Math.min(done + 1, total)} of {total}
          </Text>
          <Text style={{ ...type.marker, color: t.color.navyMuted, textTransform: 'uppercase' }}>
            {session.minutes} min · {session.goal}
          </Text>
        </View>

        {isSubstitute && (
          <View
            accessible
            accessibilityLabel={`${SUBSTITUTE_LABEL}. ${SUBSTITUTE_REASON[workout.reason.kind]}`}
            style={[
              {
                marginTop: space.lg,
                borderRadius: radius.md,
                borderLeftWidth: 4,
                borderLeftColor: t.color.yellow,
                backgroundColor: t.color.white,
                paddingHorizontal: space.lg,
                paddingVertical: space.md,
              },
              t.shadow.lift,
            ]}
          >
            <Text style={{ ...type.marker, color: t.color.yellowInk, textTransform: 'uppercase' }}>
              {SUBSTITUTE_LABEL}
            </Text>
            <Text style={{ ...type.tileHint, marginTop: space.xs, color: t.color.navyMuted }}>
              {SUBSTITUTE_REASON[workout.reason.kind]}
            </Text>
          </View>
        )}

        {current !== undefined && (
          <View style={{ marginTop: space.xl, gap: space.lg }}>
            {/* Provenance, visible but quiet. Names the actual basis. */}
            <View
              accessible
              accessibilityLabel={
                featureLabel === null
                  ? 'No equipment needed for this movement'
                  : `Using the ${featureLabel}`
              }
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  gap: 6,
                  borderRadius: radius.pill,
                  backgroundColor: t.color.white,
                  paddingHorizontal: space.md,
                  paddingVertical: 6,
                },
                t.shadow.lift,
              ]}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: featureLabel === null ? t.color.blue : t.color.green,
                }}
              />
              <Text
                style={{
                  ...type.marker,
                  textTransform: 'uppercase',
                  color: featureLabel === null ? t.color.navyMuted : t.color.greenInk,
                }}
              >
                {featureLabel === null ? 'No equipment' : `Using the ${featureLabel}`}
              </Text>
            </View>

            {/* One movement dominates. */}
            <Text
              accessibilityRole="header"
              style={{
                fontSize: 40,
                lineHeight: 42,
                fontWeight: '800',
                letterSpacing: -1.2,
                color: t.color.navy,
              }}
            >
              {exerciseName(current.item.exerciseId)}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
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
                  {big}
                </Text>
                {!isSingleEffort(parts) && (
                  <Text style={{ fontSize: 30, fontWeight: '800', color: t.color.navyFaint }}>
                    ×
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: small.length > 2 ? 44 : 76,
                    lineHeight: small.length > 2 ? 50 : 76,
                    fontWeight: '800',
                    letterSpacing: -2,
                    fontVariant: ['tabular-nums'],
                    color: t.color.blueInk,
                  }}
                >
                  {small}
                </Text>
              </View>

              <Text
                style={{
                  ...type.marker,
                  paddingBottom: space.sm,
                  textTransform: 'uppercase',
                  color: t.color.navyMuted,
                }}
              >
                {doseText(current.item.prescription)}
                {'\n'}
                {current.block}
              </Text>
            </View>

            {cues.length > 0 && (
              <View
                style={[
                  {
                    borderRadius: radius.md,
                    backgroundColor: t.color.white,
                    padding: space.lg,
                    gap: space.sm,
                  },
                  t.shadow.lift,
                ]}
              >
                {cues.map((cue) => (
                  <View
                    key={cue}
                    style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        marginTop: 8,
                        backgroundColor: t.color.blue,
                      }}
                    />
                    <Text style={{ flex: 1, fontSize: 16, lineHeight: 22, color: t.color.navy }}>
                      {cue}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
          onPress={advance}
          accessibilityRole="button"
          accessibilityLabel={done + 1 >= total ? 'Finish session' : 'Done, next movement'}
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
          <Text style={{ ...type.action, color: t.color.white }}>
            {done + 1 >= total ? 'Finish session' : 'Done'}
          </Text>
        </Pressable>

        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.lg }}
        >
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: t.color.navyMuted }}>
            {done + 1 < total
              ? `Next — ${exerciseName(items[done + 1]!.item.exerciseId)}`
              : 'Last movement'}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: t.color.navyMuted,
              fontVariant: ['tabular-nums'],
            }}
          >
            {Math.max(total - done - 1, 0)} to go
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <ProjectContentNote style={{ flex: 1 }} />
          {!finished && (
            <Pressable
              onPress={() => startSession(makeSeed(Date.now()))}
              accessibilityRole="button"
              accessibilityLabel="Generate another session"
              style={{
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: t.color.line,
                paddingHorizontal: space.md,
                paddingVertical: space.sm,
                minHeight: touch.min,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.navyMuted }}>
                Generate another
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
