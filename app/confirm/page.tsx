import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StepPage } from '@/components/shell/step-page';

export const metadata: Metadata = { title: 'Confirm the park' };

const CONFIRMED = [
  { label: 'Bench', prompt: 'Is there a standard park bench that is free to use?' },
  { label: 'Pull-up bar', prompt: 'Is there a purpose-built pull-up or horizontal bar?' },
  { label: 'Stairs', prompt: 'Are there steps or stairs you can use?' },
];

export default function ConfirmPage() {
  return (
    <StepPage
      eyebrow="Step 2 of 4"
      title="Confirm what is there"
      lede="Your workout will only use these. MoveHere never assumes a bench, a bar or a set of stairs exists."
      footer={
        <>
          <ButtonLink href="/setup" size="lg">
            Confirm and continue
          </ButtonLink>
          <ButtonLink href="/park" size="md" variant="quiet" className="self-start">
            Go back and change something
          </ButtonLink>
        </>
      }
    >
      <ul className="flex flex-col gap-3">
        {CONFIRMED.map((item) => (
          <Card key={item.label} as="li" className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium text-spruce">{item.label}</p>
              <p className="text-sm text-spruce-muted text-pretty">{item.prompt}</p>
            </div>
            <Badge tone="moss">Confirmed</Badge>
          </Card>
        ))}
      </ul>

      <p className="text-sm text-spruce-faint text-pretty">
        Confirming means you can see it and use it. It is not a judgement about whether a structure
        is safe — MoveHere cannot make that call, and does not try to.
      </p>
    </StepPage>
  );
}
