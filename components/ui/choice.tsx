import type { ReactNode } from 'react';

/**
 * Selection control built on a real radio or checkbox.
 *
 * The input stays in the DOM and keeps its native keyboard behaviour and
 * announcement; only its rendering is replaced. Selected state is carried by
 * border and background, never by colour alone.
 */
export function Choice({
  name,
  value,
  type = 'radio',
  label,
  hint,
  defaultChecked,
  icon,
}: {
  readonly name: string;
  readonly value: string;
  readonly type?: 'radio' | 'checkbox';
  readonly label: string;
  readonly hint?: string;
  readonly defaultChecked?: boolean;
  readonly icon?: ReactNode;
}) {
  return (
    <label className="group relative flex cursor-pointer items-start gap-3 rounded-md border border-rule bg-chalk-raised p-4 transition-colors duration-(--duration-quick) ease-(--ease-out-soft) hover:border-rule-strong has-checked:border-persimmon has-checked:bg-persimmon-soft has-focus-visible:outline has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      {icon !== undefined && (
        <span aria-hidden className="mt-0.5 text-spruce-faint group-has-checked:text-persimmon-deep">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-spruce">{label}</span>
        {hint !== undefined && <span className="mt-0.5 block text-sm text-spruce-muted">{hint}</span>}
      </span>
      <span
        aria-hidden
        className={
          type === 'radio'
            ? 'mt-0.5 size-5 shrink-0 rounded-full border-2 border-rule-strong group-has-checked:border-[6px] group-has-checked:border-persimmon'
            : 'mt-0.5 size-5 shrink-0 rounded-[0.3rem] border-2 border-rule-strong group-has-checked:border-persimmon group-has-checked:bg-persimmon-deep'
        }
      />
    </label>
  );
}
