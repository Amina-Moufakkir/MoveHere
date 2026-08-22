import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * The primary action.
 *
 * One geometry across MoveHere: a compact capsule, fully rounded, a vivid blue
 * fill and a white high-weight label, sitting in a pale track rather than on a
 * shadow. 66px tall and inset from the edges, matching the native client — it
 * is a control you press, not a bar across the viewport.
 */
type Variant = 'primary' | 'soft' | 'quiet';

const base =
  'inline-flex h-[66px] items-center justify-center gap-2 rounded-full px-8 text-lg font-extrabold ' +
  'tracking-[-0.01em] transition-[transform,background-color,border-color] duration-(--duration-quick) ' +
  'ease-(--ease-spring) active:scale-[0.985] disabled:pointer-events-none disabled:opacity-100 ' +
  'disabled:bg-pale disabled:text-navy-faint';

/**
 * The pale track. Presence without elevation — Daylight takes its depth from
 * colour, so a shadow here would be the one place the identity contradicted
 * itself. The inset keeps the control from spanning the viewport, which is what
 * made it read as a web CTA rather than a physical button.
 */
const track = 'rounded-full bg-blue-wash p-1.5 sm:mx-6';

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
  const button = <button {...props} className={classes(variant, full, className)} />;
  return variant === 'primary' && full ? <span className={`block ${track}`}>{button}</span> : button;
}

export function ActionLink({ variant = 'primary', full = true, className, ...props }: Shared & ComponentProps<typeof Link>) {
  const link = <Link {...props} className={classes(variant, full, className)} />;
  return variant === 'primary' && full ? <span className={`block ${track}`}>{link}</span> : link;
}
