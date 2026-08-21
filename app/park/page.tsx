import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Choice } from '@/components/ui/choice';
import { StepPage } from '@/components/shell/step-page';

export const metadata: Metadata = { title: 'What is in the park' };

/** Placeholder data. M5 wires no domain behaviour. */
const FEATURES = [
  { id: 'park-bench', label: 'Bench', hint: 'A standard park bench that is free to use' },
  { id: 'pull-up-bar', label: 'Pull-up bar', hint: 'A purpose-built bar you can hang from' },
  { id: 'parallel-bars', label: 'Parallel bars', hint: 'Purpose-built parallel or dip bars' },
  { id: 'stairs', label: 'Stairs', hint: 'Steps you can step up and down' },
  { id: 'hill', label: 'Hill', hint: 'A slope you can walk or run up' },
  { id: 'walking-running-path', label: 'Path', hint: 'A walking or running path' },
  { id: 'running-track', label: 'Running track', hint: 'A marked track' },
  { id: 'hard-court', label: 'Hard court', hint: 'Basketball, tennis or similar' },
];

export default function ParkPage() {
  return (
    <StepPage
      eyebrow="Step 1 of 4"
      title="What can you see in the park?"
      lede="Pick out anything you can see and use right now. Leave out anything you are unsure about — a missing feature costs you options, an imagined one costs you a wasted trip."
      footer={
        <>
          <ButtonLink href="/confirm" size="lg">
            Continue
          </ButtonLink>
          <p className="text-sm text-ink-faint">Nothing is saved to a server. This stays on your device.</p>
        </>
      }
    >
      <fieldset className="flex flex-col gap-2.5">
        <legend className="sr-only">Park features</legend>
        {FEATURES.map((feature) => (
          <Choice
            key={feature.id}
            type="checkbox"
            name="feature"
            value={feature.id}
            label={feature.label}
            hint={feature.hint}
          />
        ))}
      </fieldset>
    </StepPage>
  );
}
