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
 *
 * The media slot is deliberate empty space held open. It is reserved for the
 * consistent exercise visual system §15 defers, and until that exists it shows
 * the environment glyph — but only when the item actually cites a confirmed
 * feature. An environment-independent movement gets a neutral treatment rather
 * than a fabricated object, because depicting a bench for a movement that needs
 * no bench is exactly the kind of invention the whole product refuses.
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
import { FeatureGlyph } from '../components/feature-glyph';
import { ProjectContentNote } from '../components/project-content-note';
import { EmptyState } from '../components/empty-state';
import { makeSeed } from '../../src/programming/seed.ts';
import { glyph, gutter, radius, space, touch, type, useTheme } from '../theme/tokens';

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
  const featureId = basis?.kind === 'confirmed-feature' ? basis.featureId : null;
  const featureLabel =
    featureId === null ? null : (findSupportedFeature(featureId)?.label ?? featureId);
  const parts = current === undefined ? (['', ''] as const) : doseParts(current.item.prescription);
  const [big, small] = parts;
  const cues = current === undefined ? [] : exerciseCues(current.item.exerciseId);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xl }}>
        {/* Progress, full-bleed. Derived from the generated items. */}
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Movements completed"
          accessibilityValue={{ min: 0, max: total, now: done }}
          style={{ flexDirection: 'row', gap: 3, paddingHorizontal: gutter, paddingTop: space.md }}
        >
          {items.map((entry, i) => (
            <View
              key={`${entry.item.exerciseId}-${i}`}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                backgroundColor:
                  i < done ? t.color.green : i === done ? t.color.blue : t.color.line,
              }}
            />
          ))}
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: gutter,
            marginTop: space.sm,
          }}
        >
          <Text style={{ ...type.label, color: t.color.navyMuted }}>
            Movement {Math.min(done + 1, total)} of {total}
          </Text>
          <Text style={{ ...type.label, color: t.color.navyMuted }}>
            {session.minutes} min · {session.goal[0]!.toUpperCase()}{session.goal.slice(1)}
          </Text>
        </View>

        {isSubstitute && (
          <View
            accessible
            accessibilityLabel={`${SUBSTITUTE_LABEL}. ${SUBSTITUTE_REASON[workout.reason.kind]}`}
            style={{
              marginTop: space.lg,
              marginHorizontal: gutter,
              borderRadius: radius.md,
              borderLeftWidth: 4,
              borderLeftColor: t.color.yellow,
              backgroundColor: t.color.pale,
              paddingHorizontal: space.lg,
              paddingVertical: space.md,
            }}
          >
            <Text style={{ ...type.micro, color: t.color.yellowInk, textTransform: 'uppercase' }}>
              {SUBSTITUTE_LABEL}
            </Text>
            <Text style={{ ...type.body, marginTop: space.xs, color: t.color.navyMuted }}>
              {SUBSTITUTE_REASON[workout.reason.kind]}
            </Text>
          </View>
        )}

        {current !== undefined && (
          <View style={{ marginTop: space.lg }}>
            {/* ---- Media slot: reserved for the exercise visual system ---- */}
            <View
              accessible
              accessibilityLabel={
                featureLabel === null
                  ? 'No equipment needed for this movement'
                  : `Using the ${featureLabel}`
              }
              style={{
                marginHorizontal: gutter,
                /* Height, not aspect ratio. A 4:3 slot holding one glyph reads
                   as a hole in the screen; when real exercise visuals arrive
                   this can grow to their natural ratio. */
                height: 180,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
                gap: space.md,
                backgroundColor: featureLabel === null ? t.color.blueWash : t.color.paleGreen,
              }}
            >
              {featureLabel === null ? (
                /* Neutral. No object is depicted, because none is required. */
                <Text style={{ ...type.subtitle, color: t.color.blue }}>No equipment</Text>
              ) : (
                <>
                  <FeatureGlyph
                    id={featureId ?? ''}
                    size={glyph.context}
                    color={t.color.greenInk}
                  />
                  <Text style={{ ...type.label, color: t.color.greenInk }}>
                    Using the {featureLabel}
                  </Text>
                </>
              )}
            </View>

            <View style={{ paddingHorizontal: gutter, marginTop: space.xl }}>
              <Text
                accessibilityRole="header"
                style={{ ...type.title, color: t.color.navy }}
              >
                {exerciseName(current.item.exerciseId)}
              </Text>

              {/* The prescription is the event on this screen. */}
              <View
                accessible
                accessibilityLabel={doseText(current.item.prescription)}
                style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: space.sm }}
              >
                <Text
                  style={{
                    ...type.display,
                    fontVariant: ['tabular-nums'],
                    color: t.color.blueVivid,
                  }}
                >
                  {big}
                </Text>
                {!isSingleEffort(parts) && (
                  <Text
                    style={{ ...type.displaySm, marginHorizontal: 6, color: t.color.navyFaint }}
                  >
                    ×
                  </Text>
                )}
                <Text
                  style={{
                    ...(small.length > 2 ? type.displaySm : type.display),
                    fontVariant: ['tabular-nums'],
                    color: t.color.blueVivid,
                  }}
                >
                  {small}
                </Text>
              </View>

              <Text style={{ ...type.label, color: t.color.navyMuted, marginTop: space.sm }}>
                {current.block}
              </Text>

              {cues.length > 0 && (
                <View style={{ marginTop: space.xl, borderTopWidth: 1, borderTopColor: t.color.line }}>
                  {cues.map((cue) => (
                    <View
                      key={cue}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: space.md,
                        paddingVertical: space.md,
                        borderBottomWidth: 1,
                        borderBottomColor: t.color.line,
                      }}
                    >
                      <View
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 3,
                          marginTop: 8,
                          backgroundColor: t.color.blue,
                        }}
                      />
                      <Text style={{ flex: 1, ...type.lead, color: t.color.navy }}>{cue}</Text>
                    </View>
                  ))}
                </View>
              )}
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.lg }}>
          <Text style={{ flex: 1, ...type.label, fontWeight: '400', color: t.color.navyMuted }}>
            {done + 1 < total
              ? `Next — ${exerciseName(items[done + 1]!.item.exerciseId)}`
              : 'Last movement'}
          </Text>
          <Text style={{ ...type.label, color: t.color.navyMuted, fontVariant: ['tabular-nums'] }}>
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
                borderColor: t.color.lineStrong,
                paddingHorizontal: space.md,
                minHeight: touch.min,
                justifyContent: 'center',
              }}
            >
              <Text style={{ ...type.label, color: t.color.navyMuted }}>Generate another</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
