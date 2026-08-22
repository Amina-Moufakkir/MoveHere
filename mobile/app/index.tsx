/**
 * The landing screen.
 *
 * Leads with the general friction — the place, the equipment and the time a
 * person actually has — and names the park immediately as the one environment
 * that is built (§1, §4). The order matters: capability, then what exists, then
 * what MoveHere declines to decide. Stating the boundary last leaves it as the
 * closing impression, which is where a product that cannot assess structural
 * safety wants it.
 *
 * No-equipment generation is presented as continuity, never as the
 * differentiator (§4). Nothing here claims an outcome; the hypothesis that this
 * helps anyone train more consistently is unvalidated (§17), so the copy stays
 * on mechanism.
 *
 * The feature chips are read from the supported-feature registry rather than
 * retyped, so this screen can never advertise something the product does not
 * support — a Class C exclusion cannot leak onto the landing page by way of
 * marketing copy. The boundary statements and the provenance note come from
 * shared source for the same reason.
 */
import { Image, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FEATURE_REGISTRY } from '../../src/domain/feature-registry.ts';
import { SHORT_LABEL, byPresentation } from '../../src/presentation/feature-copy.ts';
import { BOUNDARY_HEADING, BOUNDARY_STATEMENTS } from '../../src/presentation/safety-copy.ts';
import { FeatureGlyph } from '../components/feature-glyph';
import { PrimaryAction } from '../components/primary-action';
import { ProjectContentNote } from '../components/project-content-note';
import { glyph, gutter, radius, space, touch, type, useTheme } from '../theme/tokens';

const STEPS = [
  {
    n: '01',
    title: 'Say what’s there',
    body: 'Pick out the benches, bars, steps and paths you can actually see.',
  },
  {
    n: '02',
    title: 'Confirm it',
    body: 'Nothing is assumed on your behalf. A session only ever uses what you confirmed yourself.',
  },
  {
    n: '03',
    title: 'Train',
    body: 'Choose how long you’ve got and what you’re after. The session is built from your list.',
  },
] as const;

/**
 * Brand photography — a real park, real people training in it.
 *
 * Atmospheric, not instructional, and not evidence of anything. It says what
 * kind of product this is; it does not claim a capability, and no scope
 * statement on this screen is derived from what happens to be visible in it.
 *
 * The frame is tall and its action — the bars and the people on them — sits in
 * the upper-middle band, with bare canopy above and empty pavement below. A
 * centred cover crop would land on the pavement, so the image is laid out at
 * its true aspect inside a clipping view and offset by a *fraction* of its own
 * height. That crops responsively at any width and never distorts.
 */
const PHOTO = require('../../img/landing-pic.jpg');
const PHOTO_RATIO = 2391 / 3761;
/** Skips the bare canopy so the crop keeps the strongest action area. */
const PHOTO_SKIP = 0.11;
const HERO_HEIGHT = 300;

const SHOWN_FEATURES = [...FEATURE_REGISTRY.supported]
  .sort((a, b) => byPresentation(a.id, b.id))
  .slice(0, 4);

const REMAINING_FEATURE_COUNT = FEATURE_REGISTRY.supported.length - SHOWN_FEATURES.length;

export default function LandingScreen() {
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const photoHeight = width / PHOTO_RATIO;

  const sectionLabel = (color: string) =>
    ({ ...type.label, color }) as const;

  /* No cards. Sections sit on the canvas and are divided by a hairline. */
  const section = {
    paddingHorizontal: gutter,
    paddingTop: space.xl,
    borderTopWidth: 1,
    borderTopColor: t.color.line,
  } as const;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.color.cloud }}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, space.lg) + space.section }}
    >
      {/* Photograph, then the words. No copy sits over the picture — the frame
          is busy, and darkening it to force legibility would be decoration
          standing in for composition. */}
      <View style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
        <Image
          source={PHOTO}
          accessible
          accessibilityRole="image"
          accessibilityLabel="An outdoor calisthenics park on a winter morning, with people training on the bars."
          resizeMode="cover"
          style={{ width, height: photoHeight, marginTop: -(photoHeight * PHOTO_SKIP) }}
        />
      </View>

      {/* ---- Hero ---- */}
      <View
        style={{
          paddingHorizontal: gutter,
          paddingTop: space.xxl,
          paddingBottom: space.xxl,
        }}
      >
        <Text
          accessibilityRole="header"
          style={{ ...type.title, color: t.color.navy }}
        >
          Train with what’s actually around you.
        </Text>

        <Text style={{ ...type.lead, color: t.color.navyMuted, marginTop: space.md }}>
          Most fitness apps hand you a workout and leave you to work out whether you can do it here.
          MoveHere starts from the other end — the place you’re in, what’s actually in it, and the
          time you’ve got.
        </Text>

        <View style={{ gap: space.md, marginTop: space.xl }}>
          <PrimaryAction label="Set up a park" onPress={() => router.push('/park')} />
          <PrimaryAction
            label="Train without equipment"
            variant="secondary"
            onPress={() => router.push('/setup')}
          />
        </View>
      </View>

      {/* ---- What is built ---- */}
      <View style={[section, { gap: space.md }]}>
        <Text accessibilityRole="header" style={sectionLabel(t.color.navyMuted)}>
          What’s built today
        </Text>

        <View>
          <Text style={{ fontSize: 17, lineHeight: 23, fontWeight: '700', color: t.color.navy }}>
            The park. That’s the one environment MoveHere understands.
          </Text>
          <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: space.sm }}>
            Tell it what’s there, confirm it, and the session is built from those features and
            nothing else. Haven’t confirmed a park, or can’t get to one? You can still generate a
            session that needs no equipment at all.
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg }}>
            {SHOWN_FEATURES.map((feature) => (
              <View
                key={feature.id}
                accessible
                accessibilityLabel={SHORT_LABEL[feature.id] ?? feature.label}
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
                <FeatureGlyph id={feature.id} size={glyph.chip} color={t.color.greenInk} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.greenInk }}>
                  {SHORT_LABEL[feature.id] ?? feature.label}
                </Text>
              </View>
            ))}
            {REMAINING_FEATURE_COUNT > 0 && (
              <View
                style={{
                  justifyContent: 'center',
                  borderRadius: radius.pill,
                  backgroundColor: t.color.cloudDeep,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: t.color.navyMuted }}>
                  and {REMAINING_FEATURE_COUNT} more
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={{ ...type.body, color: t.color.navyMuted }}>
          Anywhere else — home, a gym, whatever equipment you happen to have — is the same idea
          pointed somewhere new. None of it is built yet.
        </Text>
      </View>

      {/* ---- How it works ---- */}
      <View style={[section, { gap: space.lg, marginTop: space.xl }]}>
        <Text accessibilityRole="header" style={sectionLabel(t.color.navyMuted)}>
          How it works
        </Text>
        {STEPS.map((step) => (
          <View
            key={step.n}
            accessible
            accessibilityLabel={`Step ${step.n}. ${step.title}. ${step.body}`}
          >
            <Text style={{ ...type.micro, color: t.color.blue, textTransform: 'uppercase', fontVariant: ['tabular-nums'] }}>
              {step.n}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: t.color.navy, marginTop: space.xs }}>
              {step.title}
            </Text>
            <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: space.xs }}>
              {step.body}
            </Text>
          </View>
        ))}
      </View>

      {/* ---- The substitute, named as a substitute (§11) ---- */}
      <View style={{ paddingHorizontal: gutter, paddingTop: space.xl }}>
        <View
          style={{
            borderRadius: radius.md,
            borderLeftWidth: 4,
            borderLeftColor: t.color.yellow,
            backgroundColor: t.color.pale,
            padding: space.lg,
          }}
        >
          <Text accessibilityRole="header" style={sectionLabel(t.color.blueInk)}>
            When the park isn’t an option
          </Text>
          <Text style={{ ...type.body, color: t.color.navyMuted, marginTop: space.sm }}>
            Weather turns, plans change, or there’s nothing confirmed yet. You still get a session —
            one that needs no equipment at all. MoveHere calls that a substitute, because that is
            what it is. It is not a park session and it won’t be presented as one.
          </Text>
        </View>
      </View>

      {/* ---- What it declines to decide, last ---- */}
      <View
        style={{
          marginTop: space.xl,
          paddingHorizontal: gutter,
          paddingTop: space.xl,
          borderTopWidth: 1,
          borderTopColor: t.color.line,
          gap: space.lg,
        }}
      >
        <Text accessibilityRole="header" style={sectionLabel(t.color.navyMuted)}>
          {BOUNDARY_HEADING}
        </Text>
        {BOUNDARY_STATEMENTS.map((statement) => (
          <View
            key={statement.heading}
            accessible
            accessibilityLabel={`${statement.heading}. ${statement.body}`}
          >
            <Text style={{ fontSize: 16, fontWeight: '800', color: t.color.navy }}>
              {statement.heading}
            </Text>
            <Text style={{ ...type.lead, color: t.color.navyMuted, marginTop: space.xs }}>
              {statement.body}
            </Text>
          </View>
        ))}
        <ProjectContentNote />
      </View>
    </ScrollView>
  );
}
