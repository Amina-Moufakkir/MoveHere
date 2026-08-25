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
 * Regeneration is not here. Rebuilding a session discards the progress the
 * control beside it records, and a global, destructive action does not belong
 * a row below the one that advances a movement. It lives where sessions are
 * started: back to /setup, whose primary action already builds one from a
 * fresh seed. The stack header provides that route, so nothing was invented to
 * hold it.
 *
 * Finishing a movement gets a brief acknowledgement: the action shows a check,
 * then the progress and the movement advance together. It is confirmation of
 * physical work that was actually done, not a reward — so it is fast, silent,
 * and happens once.
 *
 * The order of operations matters more than the animation. Progress is
 * persisted **before** any of it, synchronously, on the tap. The check is
 * played over state that is already saved, so backgrounding the app, killing
 * it, or losing the frame mid-beat can never cost the user a completed
 * movement. What the beat holds back is the render, never the record.
 *
 * The media slot shows a real visual at its own ratio when one exists, and a
 * compact band otherwise. The band states which basis the item cited and
 * nothing more: an environment-independent movement gets a neutral treatment
 * rather than a fabricated object, because depicting a bench for a movement
 * that needs no bench is exactly the kind of invention the whole product
 * refuses. It is not a demonstration, and it is no longer sized like one.
 *
 * Instructions render inline, in reading order — media, movement, dose, block,
 * how to do it, cues. They were behind a sheet, which made reading them a
 * decision to open something; on a scrolling page they are simply present, and
 * a reader who does not need them scrolls past. Only an authored instruction
 * renders: outstanding and not-required produce no section and no message
 * about its absence.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Image, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { findSupportedFeature } from '../../src/domain/feature-registry.ts';
import { resolveInstructions } from '../../src/domain/instruction-resolution.ts';
import { exerciseById, exerciseCues, exerciseName } from '../../src/programming/session-builder.ts';
import {
  CUES_HEADING,
  INSTRUCTION_HEADING,
  instructionPanel,
} from '../../src/presentation/instruction-copy.ts';
import { SUBSTITUTE_LABEL, SUBSTITUTE_REASON } from '../../src/presentation/session-copy.ts';
import { doseText, prescriptionDisplay } from '../../src/presentation/prescription-copy.ts';
import { useVenue } from '../components/venue-provider';
import { FeatureGlyph } from '../components/feature-glyph';
import { PrimaryAction } from '../components/primary-action';
import { ProgressTrack } from '../components/progress-track';
import { exerciseVisualFor } from '../media/exercise-visuals.ts';
import { ProjectContentNote } from '../components/project-content-note';
import { EmptyState } from '../components/empty-state';
import { glyph, gutter, radius, space, touch, type, useTheme } from '../theme/tokens';

export default function WorkoutScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { session, workout, setDone, completeSession } = useVenue();

  const items = useMemo(
    () =>
      workout !== null && workout.kind !== 'not-generated'
        ? workout.blocks.flatMap((b) => b.items.map((item) => ({ block: b.name, item })))
        : [],
    [workout],
  );

  /**
   * The acknowledgement beat.
   *
   * `held` freezes what is displayed — never what is stored — so the check can
   * be seen on the movement it belongs to before the screen moves on.
   *
   * Declared with the other hooks, above every early return: a hook that runs
   * only on some renders is a crash, not a style question.
   */
  const [confirming, setConfirming] = useState(false);
  const [held, setHeld] = useState<number | null>(null);
  const beat = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (beat.current !== null) clearTimeout(beat.current);
    },
    [],
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
  const done = Math.min(held ?? session.done, total);
  const current = items[Math.min(done, total - 1)];
  const isSubstitute = workout.kind === 'substitute-session';

  const advance = () => {
    if (confirming) return; // one tap, one movement
    const last = done + 1 >= total;

    // Persist first. Nothing below is allowed to delay this.
    if (last) {
      setDone(total);
      completeSession(new Date().toISOString(), {
        movements: total,
        featuresUsed: workout.kind === 'park-session' ? [...workout.featuresUsed] : [],
        wasSubstitute: workout.kind === 'substitute-session',
      });
    } else {
      setDone(done + 1);
    }

    void AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) {
        if (last) router.push('/complete');
        return;
      }
      setHeld(done);
      setConfirming(true);
      beat.current = setTimeout(() => {
        setConfirming(false);
        setHeld(null);
        if (last) router.push('/complete');
      }, 380);
    });
  };

  const basis = current?.item.basis;
  const featureId = basis?.kind === 'confirmed-feature' ? basis.featureId : null;
  const featureLabel =
    featureId === null ? null : (findSupportedFeature(featureId)?.label ?? featureId);
  const dose = current === undefined ? null : prescriptionDisplay(current.item.prescription);
  /* Presentation only. A missing visual is expected, not a failure. */
  const visual =
    current === undefined
      ? null
      : /* Session and theme choose the depiction; neither touches the key. The
           session kind is already known here (§11) and no new domain concept is
           introduced — `substitute` says the park was withheld, never that the
           user is indoors. */
        exerciseVisualFor(
          current.item.exerciseId,
          featureId,
          isSubstitute ? 'substitute' : 'park',
          t.dark,
        );
  const cues = current === undefined ? [] : exerciseCues(current.item.exerciseId);

  /* Resolved against the basis this item actually cited, then flattened by
     shared presentation. Nothing here reads an authored instruction: no
     override, no default context, no step phase reaches this screen, which is
     why a context-resolved movement will need no change on it. */
  const movement = current === undefined ? null : exerciseById(current.item.exerciseId);
  const instructions =
    movement === null || current === undefined
      ? { kind: 'hidden' as const }
      : instructionPanel(resolveInstructions(movement, current.item.basis));

  return (
    <View style={{ flex: 1, backgroundColor: t.color.cloud }}>
      {/* flex: 1 is load-bearing. Without it the ScrollView sizes to its
          content, so a tall visual pushed the footer off-screen and left the
          cues below it unreachable — the content did not scroll, it was
          clipped. The footer is a sibling, so it stays put and this region
          takes whatever is left. */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: space.section }}
      >
        {/* Progress, full-bleed. Derived from the generated items. */}
        <ProgressTrack
          total={total}
          done={done}
          style={{ paddingHorizontal: gutter, paddingTop: space.md }}
        />

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
            <View style={{ paddingHorizontal: gutter }}>
              <Text
                accessibilityRole="header"
                style={{ ...type.title, color: t.color.navy }}
              >
                {exerciseName(current.item.exerciseId)}
              </Text>

              {/* The prescription is the event on this screen — but the hero
                  is whichever number is actually useful. */}
              {dose !== null && (
                <View
                  accessible
                  accessibilityLabel={doseText(current.item.prescription)}
                  style={{ marginTop: space.sm }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    {dose.kind === 'pair' ? (
                      <>
                        <Text
                          style={{ ...type.display, fontVariant: ['tabular-nums'], color: t.color.blueVivid }}
                        >
                          {dose.first.value}
                        </Text>
                        <Text style={{ ...type.displayUnit, marginLeft: 4, color: t.color.blueVivid }}>
                          {dose.first.unit}
                        </Text>
                        <Text
                          style={{ ...type.displayUnit, marginHorizontal: 8, color: t.color.navyFaint }}
                        >
                          ×
                        </Text>
                        <Text
                          style={{ ...type.display, fontVariant: ['tabular-nums'], color: t.color.blueVivid }}
                        >
                          {dose.second.value}
                        </Text>
                        <Text style={{ ...type.displayUnit, marginLeft: 4, color: t.color.blueVivid }}>
                          {dose.second.unit}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={{ ...type.display, fontVariant: ['tabular-nums'], color: t.color.blueVivid }}
                        >
                          {dose.value}
                        </Text>
                        <Text style={{ ...type.displayUnit, marginLeft: 4, color: t.color.blueVivid }}>
                          {dose.unit}
                        </Text>
                      </>
                    )}
                  </View>

                  {/* What the numbers mean, and anything demoted out of them. */}
                  {dose.support.length > 0 && (
                    <Text style={{ ...type.subtitle, color: t.color.navy, marginTop: space.xs }}>
                      {dose.support.join(' · ')}
                    </Text>
                  )}
                </View>
              )}

              <Text style={{ ...type.label, color: t.color.navyMuted, marginTop: space.xs }}>
                {current.block}
              </Text>

              {/* What the movement is performed with, stated for every item.
                  This is not media and never stands in for it: a movement with
                  a visual still cites a basis, and one without still says so.
                  Folding the two together meant gaining a picture silently cost
                  the movement its basis label, which is a fact about the
                  session rather than a decoration around the photograph. */}
              <View
                accessible
                accessibilityLabel={
                  featureLabel === null
                    ? 'No equipment needed for this movement'
                    : `Using the ${featureLabel}`
                }
                style={{
                  marginTop: space.lg,
                  minHeight: touch.action,
                  borderRadius: radius.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: space.sm,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  backgroundColor: featureLabel === null ? t.color.blueWash : t.color.paleGreen,
                }}
              >
                {featureLabel === null ? (
                  /* Neutral. No object is depicted, because none is required. */
                  <Text style={{ ...type.label, color: t.color.blue }}>No equipment</Text>
                ) : (
                  <>
                    <FeatureGlyph id={featureId ?? ''} size={glyph.row} color={t.color.greenInk} />
                    <Text style={{ ...type.label, color: t.color.greenInk }}>
                      Using the {featureLabel}
                    </Text>
                  </>
                )}
              </View>

              {/* Inline, above the cues: learning the movement comes before
                  attending to it. A sheet made this a decision to open
                  something; on a scrolling page it is simply there, and the
                  reader chooses by scrolling past. Numbered rather than
                  labelled — setup, action and return prove an instruction is
                  complete and are not how a person reads one. */}
              {instructions.kind === 'available' && (
                <View style={{ marginTop: space.lg }}>
                  <Text style={{ ...type.micro, color: t.color.navyFaint, textTransform: 'uppercase' }}>
                    {INSTRUCTION_HEADING}
                  </Text>
                  <View style={{ marginTop: space.sm, borderTopWidth: 1, borderTopColor: t.color.line }}>
                    {instructions.steps.map((stepText, index) => (
                      <View
                        key={stepText}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: space.md,
                          paddingVertical: space.md,
                          borderBottomWidth: 1,
                          borderBottomColor: t.color.line,
                        }}
                      >
                        <Text
                          style={{
                            ...type.label,
                            color: t.color.blueVivid,
                            fontVariant: ['tabular-nums'],
                            minWidth: 18,
                          }}
                        >
                          {index + 1}
                        </Text>
                        <Text style={{ flex: 1, ...type.lead, color: t.color.navy }}>{stepText}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* The visual follows the written instruction rather than
                  preceding it. Ahead of the steps a 3:2 frame pushed every one
                  of them past the fold, so the movements carrying a produced
                  asset showed less of how to perform them than the movements
                  carrying none — the picture was costing the instruction it
                  exists to support. Here it is what a reader reaches after the
                  steps: supporting evidence for an instruction, not the thing
                  the screen is arranged around.

                  Absent media renders nothing at all. No placeholder, no empty
                  frame, no disabled control — an unillustrated movement is not
                  a broken illustrated one, and the basis above already states
                  what it uses. */}
              {visual !== null && (
                <View
                  /* Sized from the asset's own ratio: the production brief
                     fixes 3:2, and a slot that cropped or shrank it would
                     change what a conforming asset depicts to fit the player. */
                  style={{
                    marginTop: space.lg,
                    aspectRatio: visual.aspectRatio,
                    borderRadius: radius.lg,
                    overflow: 'hidden',
                    backgroundColor: t.color.pale,
                  }}
                >
                  <Image
                    source={visual.source}
                    accessible
                    accessibilityRole="image"
                    accessibilityLabel={visual.alt}
                    resizeMode="cover"
                    /* The container owns the box; the image fills it. An Image
                       given a height but no width takes its intrinsic width,
                       which overflows the screen and leaves the slot blank. */
                    style={{ width: '100%', height: '100%' }}
                  />
                </View>
              )}

              {cues.length > 0 && (
                <View style={{ marginTop: space.lg }}>
                  <Text style={{ ...type.micro, color: t.color.navyFaint, textTransform: 'uppercase' }}>
                    {CUES_HEADING}
                  </Text>
                </View>
              )}
              {cues.length > 0 && (
                <View style={{ marginTop: space.sm, borderTopWidth: 1, borderTopColor: t.color.line }}>
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
        <PrimaryAction
          label={done + 1 >= total ? 'Finish session' : 'Done'}
          accessibilityLabel={done + 1 >= total ? 'Finish session' : 'Done, next movement'}
          confirming={confirming}
          onPress={advance}
        />

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

        {/* Full width, wording untouched. It was sharing this row with a
            regenerate control and wrapping to five lines as a result; the
            footprint was the layout, not the sentence. */}
        <ProjectContentNote />
      </View>
    </View>
  );
}
