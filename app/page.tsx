import Image from 'next/image';
import heroImage from '@/img/landing-page.png';
import { ActionLink } from '@/components/ui/action';
import { Icon } from '@/components/brand/icon';
import { PageContainer } from '@/components/shell/page-container';
import { LoopSteps } from '@/components/marketing/loop-steps';
import { SessionPreview, type PreviewBlock } from '@/components/marketing/session-preview';
import { doseText } from '@/src/presentation/prescription-copy.ts';
import { exerciseName, generateFor } from '@/src/programming/session-builder.ts';
import type { MarketingGlyph } from '@/src/presentation/feature-glyphs.ts';

/**
 * The public landing page.
 *
 * Built against the approved design anchor in `docs/design/`, which governs
 * visual direction and authorizes no capability (§23.7).
 *
 * **The anchor's slots are preserved; its claims are not.** Four of the twelve
 * labels it shows describe capability MoveHere does not have — Works Anywhere,
 * Track Progress, Beginner to Advanced, Your Pace. v4.6 classifies three of
 * those as PLANNED and refuses the fourth, and §22's rule is that planned
 * capability does not become production copy before it works. So each slot keeps
 * its position, its icon and its visual weight, and takes copy that is true
 * today. Softening an unauthorized claim would still be making it.
 *
 * **This is a compact single-page composition.** The anchor communicates the
 * whole product before substantial scrolling and ends after the benefit row.
 * There is no numbered How It Works section below the fold — the hero's
 * four-step row carries `#how-it-works` and is the destination for both the
 * header link and the secondary CTA. An earlier build turned each nav label into
 * a viewport-scale section and reached 4.26 viewports.
 *
 * The brand statement is the one place the page speaks about the destination
 * rather than the present. "Work out. Anywhere." is defensible as a brand line
 * (§23.2): environment-independent sessions genuinely do work anywhere, and the
 * vision really is broader than parks. Capability copy stays narrower.
 *
 * The safety boundary statements render in the site footer on every page (§9).
 */

/* The preview is a real session from the real generator, produced at build
   time. A hand-written workout would be the only session on this site the
   product could not actually produce. */
const PREVIEW_MINUTES = 30;
const PREVIEW_GOAL = 'strength' as const;

const previewBlocks: readonly PreviewBlock[] = (() => {
  const session = generateFor({
    inventory: null,
    minutes: PREVIEW_MINUTES,
    goal: PREVIEW_GOAL,
    conditions: 'acceptable',
    seed: 'landing-preview',
  });
  if (session === null || session.kind === 'not-generated') return [];
  return session.blocks.map((block) => ({
    name: block.name,
    items: block.items.slice(0, 3).map((item) => ({
      name: exerciseName(item.exerciseId),
      dose: doseText(item.prescription),
    })),
  }));
})();

/* The hero shows a corner of a real session, not the whole thing: enough that
   the movement names and doses are legibly real, short enough that the card
   stays a supporting object beside the photograph. */
const heroPreviewBlocks: readonly PreviewBlock[] = previewBlocks
  .slice(0, 1)
  .map((block) => ({ ...block, items: block.items.slice(0, 3) }));

/* The anchor's four strip slots, in its order and with its icons. Slot 2 is its
   "Works Anywhere", slot 3 its "Smart & Adaptive", slot 4 its "Track Progress".
   Slot 3 is the one genuinely unlocked today: v4.6 recognises adaptation to
   confirmed environment and reported conditions as CURRENT, so that slot keeps
   its meaning rather than being substituted. */
const FEATURES: readonly {
  readonly id?: string;
  readonly title: string;
  readonly body: string;
  readonly icon: MarketingGlyph;
}[] = [
  {
    id: 'park-first',
    title: 'Park-First',
    body: 'Built around benches, bars, steps and open ground.',
    icon: 'tree',
  },
  {
    title: 'No Equipment? No Problem.',
    body: 'No usable park setup? MoveHere builds a no-equipment session instead.',
    icon: 'equipment',
  },
  {
    title: 'Smart About What’s There',
    body: 'Sessions use the features you confirmed and the conditions you report.',
    icon: 'brain',
  },
  {
    title: 'Fits Your Time',
    body: '10, 20, 30 or 45 minutes.',
    icon: 'time',
  },
];

/* The anchor's lower row: icon over a two-line label. Slot 2 stands where
   "Beginner to Advanced" does — a claim §23.4 refuses outright. "Beginner-
   friendly. Clear instructions." is not a softened version of it: it describes
   the current target user (§3) and the existence of authored movement
   instructions (§8), and it is not a step toward the claim it replaces. */
const BENEFITS: readonly {
  readonly first: string;
  readonly second: string;
  readonly icon: MarketingGlyph;
}[] = [
  { first: 'No Equipment?', second: 'No Problem.', icon: 'equipment' },
  { first: 'Beginner-friendly.', second: 'Clear instructions.', icon: 'person' },
  { first: 'Short on Time?', second: 'We’ve Got You.', icon: 'time' },
  { first: 'Your Goal.', second: 'Your Time.', icon: 'goal' },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-36 pt-14 sm:pt-20 xl:pb-52">
        {/* The photograph is the composition, not an illustration beside it: a
            full-height plane bleeding off the right edge, with the content field
            dissolving into it rather than sitting in a second column. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[68%] xl:block"
        >
          <Image
            src={heroImage}
            alt=""
            priority
            sizes="68vw"
            className="size-full object-cover object-[42%_50%]"
          />
          <div className="hero-veil absolute inset-0" />
          <div className="hero-veil-base absolute inset-x-0 bottom-0 h-48" />
        </div>

        <PageContainer measure="marketing-wide" className="relative">
          <div className="max-w-xl xl:max-w-[36rem]">
            <p className="inline-flex items-center gap-2 rounded-full bg-park-tint px-3.5 py-1.5 text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-park-ink">
              <Icon name="leaf" size="xs" className="text-park" />
              Park-first workouts
            </p>

            <h1 className="mt-6 text-[2.75rem] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[4.25rem]">
              Work out.
              <br />
              Anywhere.
              <br />
              <span className="text-park">MoveHere.</span>
            </h1>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-navy-muted text-pretty">
              Venue-aware workouts built around the space and features you actually have.
            </p>

          </div>

          {/* Below xl the bleeding plane has nowhere to bleed to, so the
              photograph becomes the proposition's immediate explanation: it
              follows the headline and supporting line and precedes the steps
              and controls. It used to sit after the trust line, which put the
              product's one piece of evidence below everything it was meant to
              justify. Full container measure rather than the copy column —
              this is a hero element, not a content card. */}
          <div className="mt-10 overflow-hidden rounded-2xl xl:hidden">
            <Image
              src={heroImage}
              alt=""
              sizes="(min-width: 640px) 92vw, 100vw"
              className="aspect-[4/3] w-full object-cover object-[46%_42%] sm:aspect-[16/9]"
            />
          </div>

          <div className="mt-10 max-w-xl xl:mt-9 xl:max-w-[36rem]">
            {/* This row is How It Works. There is no second one. */}
            <div>
              <LoopSteps id="how-it-works" />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              {/* `full` defaults to true for the session flow, where a control
                  spans the column. Here two CTAs sit side by side. */}
              <ActionLink href="/park" variant="accent" full={false}>
                Start Your Workout
                <Icon name="chevron" size="xs" />
              </ActionLink>
              <ActionLink href="#how-it-works" variant="outline" full={false}>
                See How It Works
                <Icon name="play" size="xs" className="text-park" />
              </ActionLink>
            </div>

            <p className="mt-6 flex items-start gap-2.5 text-base font-bold text-navy-muted">
              <Icon name="trust" size="sm" className="mt-0.5 shrink-0 text-park" />
              No gym membership. Just the park and the time you have.
            </p>


          </div>

        </PageContainer>
      </section>

      {/* Lifted over the hero boundary so the photograph, the strip and the
          preview read as one plane. The overlap is the composition. */}
      <section id="features" className="relative z-10 -mt-28 scroll-mt-24 lg:-mt-36">
        <PageContainer measure="marketing-wide" className="relative">
          {/* A fifth, empty grid track — but only from xl, which is where the
              preview it exists for actually renders. It used to start at lg,
              so between 1024 and 1279 the strip reserved 216px for a card that
              was hidden: four columns squeezed from 240px to 183px beside dead
              space. A lane and the thing it holds have to share a breakpoint.

              The anchor does not give its four columns equal usable width — the
              phone occupies a lane on the right and the fourth column's copy is
              visibly narrower for it. Reserving that lane is what lets the
              preview cross the strip without ever covering a column's content. */}
          <ul className="grid rounded-[2rem] border border-line bg-park-panel px-2 py-8 shadow-float sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[repeat(4,1fr)_13.5rem]">
            {FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                id={feature.id}
                className={[
                  'flex scroll-mt-28 flex-col gap-3 px-6 sm:px-8',
                  /* Hairline separators rather than gaps: the anchor's items are
                     divisions of one surface, not four cards sitting near
                     each other. Suppressed on the first item of each row. */
                  index % 2 === 0 ? '' : 'sm:border-l sm:border-line',
                  index === 0 ? '' : 'lg:border-l lg:border-line',
                  index >= 2 ? 'mt-8 sm:mt-8 lg:mt-0' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon name={feature.icon} className="text-park" />
                <h2 className="text-base font-extrabold leading-snug text-navy text-balance">
                  {feature.title}
                </h2>
                <p className="text-sm leading-relaxed text-navy-muted text-pretty">{feature.body}</p>
              </li>
            ))}
          </ul>

          {/* Sits in the reserved lane and crosses the strip in both
              directions — above its top edge and below its bottom — which is
              the relationship the anchor establishes. Resting it on the top
              edge, as the previous build did, read as a card dropped onto the
              panel rather than a layer passing through it. */}
          <div className="pointer-events-none absolute -top-14 right-[4.25rem] hidden w-[13.5rem] xl:block">
            <SessionPreview
              minutes={PREVIEW_MINUTES}
              goal={PREVIEW_GOAL}
              goalLabel="Strength"
              blocks={heroPreviewBlocks}
              compact
            />
          </div>
        </PageContainer>
      </section>

      <section className="pb-16 pt-14 sm:pb-20 sm:pt-16">
        <PageContainer measure="marketing-wide">
          <p className="text-center text-xl font-extrabold text-navy text-balance">
            Built for real people with real lives.
          </p>
          <ul className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit.first} className="flex items-start justify-center gap-3">
                <Icon name={benefit.icon} className="mt-0.5 shrink-0 text-park" />
                <span className="text-[0.9375rem] font-bold leading-snug text-navy text-pretty">
                  {benefit.first}
                  <br />
                  {benefit.second}
                </span>
              </li>
            ))}
          </ul>
        </PageContainer>
      </section>
    </>
  );
}
