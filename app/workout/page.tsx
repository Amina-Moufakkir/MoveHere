import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heading } from '@/components/ui/heading';
import { StepPage } from '@/components/shell/step-page';
import { ProjectContentNote } from '@/components/labels/project-content-note';

export const metadata: Metadata = { title: 'Your session' };

const BLOCKS = [
  {
    name: 'Strength',
    items: [
      { name: 'Bench step-up', dose: '4 × 10 per side', source: 'Bench' },
      { name: 'Push-up', dose: '4 × 10', source: null },
      { name: 'Single-leg deadlift', dose: '4 × 10 per side', source: null },
    ],
  },
  {
    name: 'Accessory',
    items: [
      { name: 'Pull-up', dose: '3 × 5', source: 'Pull-up bar' },
      { name: 'Plank', dose: '3 × 30 seconds', source: null },
    ],
  },
];

export default function WorkoutPage() {
  return (
    <StepPage
      eyebrow="Step 4 of 4"
      title="30 minutes · Strength"
      footer={
        <>
          <ButtonLink href="/complete" size="lg">
            Finish session
          </ButtonLink>
          <ProjectContentNote />
        </>
      }
    >
      <Progress value={2} total={5} label="Movements done" />

      <div className="flex flex-col gap-6">
        {BLOCKS.map((block) => (
          <section key={block.name} className="flex flex-col gap-3">
            <Heading level={2} size="section">
              {block.name}
            </Heading>
            <ul className="flex flex-col gap-2.5">
              {block.items.map((item) => (
                <Card key={item.name} as="li" className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-medium text-ink">{item.name}</p>
                    <p className="text-sm tabular-nums text-ink-muted">{item.dose}</p>
                  </div>
                  {item.source !== null && <Badge tone="moss">{item.source}</Badge>}
                </Card>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </StepPage>
  );
}
