import type { ReactNode } from 'react';

type Tone = 'neutral' | 'moss' | 'clay';

const tones: Record<Tone, string> = {
  neutral: 'border-rule bg-chalk-deep text-spruce-muted',
  moss: 'border-rule-strong bg-persimmon-soft text-persimmon-deep',
  clay: 'border-ochre bg-ochre-soft text-ochre-deep',
};

export function Badge({
  tone = 'neutral',
  children,
}: {
  readonly tone?: Tone;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-label font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
