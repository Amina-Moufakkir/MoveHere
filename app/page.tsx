import { ButtonLink } from '@/components/ui/button';
import { Heading, Lede } from '@/components/ui/heading';
import { PageContainer } from '@/components/shell/page-container';
import { ProjectContentNote } from '@/components/labels/project-content-note';

const STEPS = [
  { n: '01', title: 'Say what the park has', body: 'Pick out the benches, bars, steps and paths you can actually see.' },
  { n: '02', title: 'Confirm it', body: 'Nothing is assumed. A workout only uses what you have confirmed yourself.' },
  { n: '03', title: 'Train', body: 'Choose how long you have, and get a session built from what is there.' },
];

export default function LandingPage() {
  return (
    <PageContainer className="flex flex-1 flex-col justify-center gap-14 py-16 sm:py-24">
      <div className="flex flex-col gap-6">
        <Heading level={1} size="display">
          Workouts built from the park you already walk past.
        </Heading>
        <Lede>
          Most fitness apps hand you a workout and leave you to work out whether you can do it here.
          MoveHere starts from the other end: tell it what the park has, and it builds a session that
          fits.
        </Lede>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <ButtonLink href="/park" size="lg">
            Set up a park
          </ButtonLink>
          <ButtonLink href="/setup" size="lg" variant="secondary">
            Train without one
          </ButtonLink>
        </div>
      </div>

      <ol className="grid gap-px overflow-hidden rounded-[--radius-lg] border border-rule bg-rule sm:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="flex flex-col gap-2 bg-chalk-raised p-5">
            <span className="text-label font-semibold tabular-nums text-persimmon-deep">{step.n}</span>
            <h2 className="font-semibold text-spruce">{step.title}</h2>
            <p className="text-sm text-spruce-muted text-pretty">{step.body}</p>
          </li>
        ))}
      </ol>

      <ProjectContentNote />
    </PageContainer>
  );
}
