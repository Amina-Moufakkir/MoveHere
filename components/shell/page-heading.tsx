import type { ReactNode } from 'react';

/**
 * The stage heading: eyebrow, title, and an optional line of explanation.
 *
 * Four real consumers — park, confirm, setup and complete — had this block
 * hand-written four times with four sets of margins (`mt-2.5`, `mt-2`, `mt-4`)
 * and two eyebrow colours. The spacing drift is the reason to extract it, not
 * the markup: a heading that sits differently on every screen makes a five-step
 * flow feel like five products.
 *
 * `tone` exists because complete's eyebrow is green and the setup stages' are
 * blue, and that difference is meaningful rather than incidental — blue is the
 * stage you are on, green is the state you reached (§15). Encoding the two as a
 * named choice keeps a third from being invented casually.
 *
 * Copy is passed in unchanged. This component standardises rhythm, not wording.
 */
export function PageHeading({
  eyebrow,
  title,
  lede,
  tone = 'current',
  children,
}: {
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly lede?: ReactNode;
  /** `current` — a stage in progress. `complete` — a stage reached. */
  readonly tone?: 'current' | 'complete';
  /** Stage-specific content below the lede, e.g. confirmed-feature chips. */
  readonly children?: ReactNode;
}) {
  return (
    <div>
      {eyebrow !== undefined && (
        <p
          className={[
            'text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing)',
            tone === 'complete' ? 'text-green-ink' : 'text-blue-ink',
          ].join(' ')}
        >
          {eyebrow}
        </p>
      )}

      <h1 className="mt-2.5 text-page font-extrabold text-balance">{title}</h1>

      {lede !== undefined && (
        <p className="mt-2.5 max-w-md text-base leading-snug text-navy-muted text-pretty">{lede}</p>
      )}

      {children}
    </div>
  );
}
