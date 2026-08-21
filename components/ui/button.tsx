import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'quiet';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-[--radius-md] font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-(--duration-quick) ease-(--ease-out-soft) ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-45';

const variants: Record<Variant, string> = {
  primary: 'bg-moss text-white hover:bg-moss-deep',
  secondary: 'border border-line-strong bg-surface text-ink hover:border-ink-muted',
  quiet: 'text-ink-muted hover:bg-surface-sunken hover:text-ink',
};

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-4 text-[0.9375rem]',
  lg: 'min-h-14 w-full px-6 text-base sm:w-auto sm:min-w-56',
};

const classes = (variant: Variant, size: Size, className?: string) =>
  [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');

interface Shared {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: Shared & ComponentProps<'button'>) {
  return <button {...props} className={classes(variant, size, className)} />;
}

/** Same surface as Button for navigation. Links stay links, for keyboard and middle-click. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: Shared & ComponentProps<typeof Link>) {
  return <Link {...props} className={classes(variant, size, className)} />;
}
