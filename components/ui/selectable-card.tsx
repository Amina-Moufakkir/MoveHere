import type { ChangeEventHandler, ReactNode } from 'react';

/**
 * A card you choose, backed by a real input.
 *
 * Extracted on evidence rather than symmetry: `/park`'s feature card and
 * `/setup`'s duration and focus cards already carried a character-identical
 * class string — the same border, the same radius, the same spring, the same
 * `has-checked` fill, the same focus ring — copied three times across two
 * routes. A visual contract duplicated that precisely will drift, and the
 * selected state is one of the few things on these screens a person must be
 * able to trust at a glance.
 *
 * **The input is real and stays real.** A `<label>` wrapping a visually hidden
 * `<input>` gives checked state, keyboard operation, group semantics and
 * screen-reader announcement for free. A `<div>` with a click handler would
 * have to reimplement all four and would get at least one of them wrong.
 * `has-checked:` styles the surface from the input's own state, so what is
 * painted and what is announced cannot disagree.
 *
 * Selection is never signalled by colour alone — callers render a check mark,
 * and the input's own checked state is what assistive technology reports.
 *
 * Deliberately owns only the surface. Layout inside the card belongs to the
 * screen: a duration card centres one numeral, a feature card stacks a glyph
 * above a name and a hint, and forcing both through one arrangement prop would
 * be a worse abstraction than the duplication it replaced.
 */
export function SelectableCard({
  type,
  name,
  value,
  checked,
  onChange,
  className,
  children,
}: {
  readonly type: 'checkbox' | 'radio';
  readonly name: string;
  readonly value: string;
  readonly checked: boolean;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  /** Layout for this screen's content — padding, direction, alignment. */
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <label
      className={[
        'group relative flex cursor-pointer select-none rounded-2xl border border-line bg-cloud',
        'transition-[transform,background-color,border-color] duration-(--duration-quick) ease-(--ease-spring)',
        'hover:border-line-strong active:scale-[0.985]',
        /* Blue, because on these screens a selection is a current choice and
           not yet a confirmed fact. Green would say the environment is
           trusted, which is a claim only /confirm may make (§15). */
        'has-checked:border-blue has-checked:bg-blue has-checked:text-white',
        'has-focus-visible:outline has-focus-visible:outline-3 has-focus-visible:outline-offset-3 has-focus-visible:outline-focus',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {children}
    </label>
  );
}
