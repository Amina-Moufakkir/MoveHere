import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Choice } from '@/components/ui/choice';
import { Heading } from '@/components/ui/heading';
import { StepPage } from '@/components/shell/step-page';
import { SubstituteNotice } from '@/components/labels/substitute-notice';
import { EmptyState } from '@/components/ui/empty-state';

export const metadata: Metadata = { title: 'Session complete' };

export default function CompletePage() {
  return (
    <StepPage
      eyebrow="Done"
      title="Session logged"
      lede="30 minutes of strength work, using the bench and the bar you confirmed."
      footer={
        <>
          <ButtonLink href="/setup" size="lg">
            Train again
          </ButtonLink>
          <ButtonLink href="/" size="md" variant="quiet" className="self-start">
            Back to start
          </ButtonLink>
        </>
      }
    >
      <section className="flex flex-col gap-3">
        <Heading level={2} size="section">
          Was anything unusable?
        </Heading>
        <p className="text-sm text-ink-muted text-pretty">
          If something was occupied, flooded or fenced off, say so. It stays on the park&rsquo;s
          record and is left out of sessions until you say it is back.
        </p>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Report an unusable feature</legend>
          <Choice type="checkbox" name="unusable" value="park-bench" label="Bench" />
          <Choice type="checkbox" name="unusable" value="pull-up-bar" label="Pull-up bar" />
        </fieldset>
      </section>

      {/* Placeholder examples of the two intentional labels and the empty state. */}
      <section className="flex flex-col gap-3">
        <Heading level={2} size="section">
          Last time
        </Heading>
        <SubstituteNotice reason="Conditions were bad, so this was a no-equipment session rather than a park session." />
      </section>

      <EmptyState
        title="No park set up yet"
        body="Tell MoveHere what your nearest park has and it will start building sessions around it."
        action={
          <ButtonLink href="/park" size="md" variant="secondary">
            Set up a park
          </ButtonLink>
        }
      />
    </StepPage>
  );
}
