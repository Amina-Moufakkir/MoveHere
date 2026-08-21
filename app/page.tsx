import { ActionLink } from '@/components/ui/action';
import { FeatureGlyph } from '@/components/brand/feature-glyph';
import { ProjectContentNote } from '@/components/labels/project-content-note';
import { FEATURE_REGISTRY } from '@/src/domain/feature-registry.ts';
import { SHORT_LABEL, byPresentation } from '@/lib/feature-presentation';

/**
 * The landing page.
 *
 * It leads with the general friction — the place, the equipment and the time a
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
 */

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
 * Read from the supported-feature registry rather than retyped, so the page can
 * never advertise something the product does not actually support — a Class C
 * exclusion cannot leak onto the landing page by way of marketing copy.
 */
const SHOWN_FEATURES = [...FEATURE_REGISTRY.supported]
  .sort((a, b) => byPresentation(a.id, b.id))
  .slice(0, 4);

const REMAINING_FEATURE_COUNT = FEATURE_REGISTRY.supported.length - SHOWN_FEATURES.length;

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="open-sky px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-20">
        <div className="mx-auto w-full max-w-2xl">
          <h1 className="text-hero font-extrabold text-balance">
            Train with what’s actually around you.
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-snug text-navy-muted text-pretty">
            Most fitness apps hand you a workout and leave you to work out whether you can do it
            here. MoveHere starts from the other end — the place you’re in, what’s actually in it,
            and the time you’ve got.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ActionLink href="/park" full={false} className="w-full sm:w-auto">
              Set up a park
            </ActionLink>
            <ActionLink href="/setup" variant="soft" full={false} className="w-full sm:w-auto">
              Train without equipment
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink">
            What’s built today
          </h2>

          <div className="rounded-xl bg-white p-5 shadow-(--shadow-lift) sm:p-6">
            <p className="text-lg font-bold leading-snug text-navy text-pretty">
              The park. That’s the one environment MoveHere understands.
            </p>
            <p className="mt-2.5 text-base leading-snug text-navy-muted text-pretty">
              Tell it what’s there, confirm it, and the session is built from those features and
              nothing else. Haven’t confirmed a park, or can’t get to one? You can still generate a
              session that needs no equipment at all.
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              {SHOWN_FEATURES.map((feature) => (
                <li
                  key={feature.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pale-green px-3 py-1.5 text-sm font-bold text-green-ink"
                >
                  <FeatureGlyph id={feature.id} className="size-4" />
                  {SHORT_LABEL[feature.id] ?? feature.label}
                </li>
              ))}
              {REMAINING_FEATURE_COUNT > 0 && (
                <li className="inline-flex items-center rounded-full bg-cloud-deep px-3 py-1.5 text-sm font-bold text-navy-muted">
                  and {REMAINING_FEATURE_COUNT} more
                </li>
              )}
            </ul>
          </div>

          <p className="text-base leading-snug text-navy-muted text-pretty">
            Anywhere else — home, a gym, whatever equipment you happen to have — is the same idea
            pointed somewhere new. None of it is built yet.
          </p>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-muted">
            How it works
          </h2>

          <ol className="mt-4 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((step) => (
              <li
                key={step.n}
                className="flex flex-col gap-1.5 rounded-xl bg-white p-5 shadow-(--shadow-lift)"
              >
                <span
                  aria-hidden
                  className="text-marker font-extrabold tabular-nums tracking-(--text-marker--letter-spacing) text-blue-ink"
                >
                  {step.n}
                </span>
                <h3 className="font-extrabold text-navy">{step.title}</h3>
                <p className="text-sm leading-snug text-navy-muted text-pretty">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-8 sm:pb-14">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-xl border-l-4 border-yellow bg-pale px-5 py-5 sm:px-6">
            <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-blue-ink">
              When the park isn’t an option
            </h2>
            <p className="mt-2.5 text-base leading-snug text-navy-muted text-pretty">
              Weather turns, plans change, or there’s nothing confirmed yet. You still get a
              session — one that needs no equipment at all. MoveHere calls that a substitute,
              because that is what it is. It is not a park session and it won’t be presented as
              one.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
          <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-muted">
            What MoveHere doesn’t decide
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-navy">Whether anything is safe to use</h3>
              <p className="mt-1 text-base leading-snug text-navy-muted text-pretty">
                MoveHere can tell that a bench is a bench. It has no idea whether that particular
                bench is sound, or whether it will take your weight. It has never seen it. You look
                at it, and you decide.
              </p>
            </div>

            <div>
              <h3 className="font-extrabold text-navy">Anything medical</h3>
              <p className="mt-1 text-base leading-snug text-navy-muted text-pretty">
                No injury programming, no rehabilitation, no working around a condition. That isn’t
                a feature waiting to be added — it’s a line MoveHere doesn’t cross.
              </p>
            </div>
          </div>

          <ProjectContentNote />
        </div>
      </section>
    </div>
  );
}
