import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

/**
 * The primary action.
 *
 * A full-width pill on a phone, because that is where a thumb is. The fill is
 * the reference blue itself — white on it measures 5.29:1, so it carries a
 * label at any size without reaching for a darker step.
 *
 * It presses. Small physical feedback matters more in a product used mid-effort
 * than any amount of polish elsewhere.
 */
type Variant = 'primary' | 'soft' | 'quiet';

const base =
  'inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-7 text-base font-extrabold ' +
  'tracking-[-0.01em] transition-[transform,background-color,box-shadow] duration-(--duration-quick) ' +
  'ease-(--ease-spring) active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white shadow-(--shadow-lift) hover:bg-blue-deep hover:shadow-(--shadow-raise)',
  soft: 'bg-pale text-blue-ink hover:bg-line',
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
