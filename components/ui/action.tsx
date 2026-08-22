import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * The primary action.
 *
 * One geometry across MoveHere: a large capsule, fully rounded, a vivid blue
 * fill and a white high-weight label, with essentially no elevation. Depth in
 * Daylight comes from colour and hairlines; a raised pill on a white canvas is
 * the web-button look this identity removes.
 *
 * 60px tall, matching the native client exactly — it is pressed outdoors,
 * one-handed, sometimes mid-effort.
 */
type Variant = 'primary' | 'soft' | 'quiet';

const base =
  'inline-flex min-h-[60px] items-center justify-center gap-2 rounded-full px-8 text-base font-extrabold ' +
  'tracking-[-0.01em] transition-[transform,background-color,border-color] duration-(--duration-quick) ' +
  'ease-(--ease-spring) active:scale-[0.985] disabled:pointer-events-none disabled:opacity-100 ' +
  'disabled:bg-pale disabled:text-navy-faint';

const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-deep',
  soft: 'border border-line-strong bg-cloud text-blue hover:border-blue',
  quiet: 'text-navy-muted hover:text-navy',
};

const classes = (variant: Variant, full: boolean, className?: string) =>
  [base, variants[variant], full ? 'w-full' : '', className].filter(Boolean).join(' ');

interface Shared {
  readonly variant?: Variant;
  readonly full?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Action({ variant = 'primary', full = true, className, ...props }: Shared & ComponentProps<'button'>) {
  return <button {...props} className={classes(variant, full, className)} />;
}

export function ActionLink({ variant = 'primary', full = true, className, ...props }: Shared & ComponentProps<typeof Link>) {
  return <Link {...props} className={classes(variant, full, className)} />;
}
