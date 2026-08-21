import type { ReactNode } from 'react';

type Tone = 'neutral' | 'moss' | 'clay';

const tones: Record<Tone, string> = {
  neutral: 'border-line bg-surface-sunken text-ink-muted',
  moss: 'border-moss-line bg-moss-soft text-moss-deep',
  clay: 'border-clay-line bg-clay-soft text-clay',
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
