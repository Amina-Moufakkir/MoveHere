import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Choice } from '@/components/ui/choice';
import { Heading } from '@/components/ui/heading';
import { StepPage } from '@/components/shell/step-page';

export const metadata: Metadata = { title: 'Set up the session' };

const DURATIONS = ['10', '20', '30', '45'];

export default function SetupPage() {
  return (
    <StepPage
      eyebrow="Step 3 of 4"
      title="How long, and what kind?"
      footer={
        <ButtonLink href="/workout" size="lg">
          Build the session
        </ButtonLink>
      }
    >
      <section className="flex flex-col gap-3">
        <Heading level={2} size="section">
          Time available
        </Heading>
        <fieldset>
          <legend className="sr-only">Session length in minutes</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {DURATIONS.map((value, index) => (
              <label
                key={value}
                className="relative flex cursor-pointer flex-col items-center gap-0.5 rounded-[--radius-md] border border-rule bg-chalk-raised px-3 py-4 transition-colors duration-(--duration-quick) hover:border-rule-strong has-checked:border-persimmon has-checked:bg-persimmon-soft has-focus-visible:outline has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
              >
                <input
                  type="radio"
                  name="duration"
                  value={value}
                  defaultChecked={index === 2}
                  className="sr-only"
                />
                <span className="text-title font-semibold tabular-nums">{value}</span>
                <span className="text-label text-spruce-muted">minutes</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2} size="section">
          Focus
        </Heading>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Session goal</legend>
          <Choice name="goal" value="strength" label="Strength" hint="Fewer movements, more work per movement" defaultChecked />
          <Choice name="goal" value="conditioning" label="Conditioning" hint="Continuous work, shorter rests" />
        </fieldset>
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2} size="section">
          Conditions outside
        </Heading>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="sr-only">Outdoor conditions</legend>
          <Choice name="conditions" value="acceptable" label="Fine to train outside" defaultChecked />
          <Choice name="conditions" value="adverse" label="Bad out there" hint="Rain, ice, heat, or dark" />
          <Choice name="conditions" value="unknown" label="Not sure" hint="Treated the same as bad conditions" />
        </fieldset>
      </section>
    </StepPage>
  );
}
