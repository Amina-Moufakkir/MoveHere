/**
 * The operational flow, as one model.
 *
 * **Route matching is normalized in exactly one place.** `next.config.mjs` sets
 * `trailingSlash: true` so the static export emits `park/index.html` rather than
 * `park.html`, which means `usePathname()` returns `/park/` while a hand-written
 * table holds `/park`. The header compared them with `===`, got `-1` from every
 * route, and silently rendered no progress at all on all five screens — the
 * `aria-current="step"` and the screen-reader step labels were unreachable for
 * as long as the export has had trailing slashes.
 *
 * A defect that presents as "nothing renders" is worse than one that throws, so
 * the fix is a named comparison rather than a slash appended at each call site.
 * Scattering `'/park/'` literals would work once and rot the next time the
 * export configuration changes.
 *
 * **These are workflow stages, not achievements.** The flow describes where a
 * person is in one session's setup and execution. It carries no history, no
 * streak, and no notion of improvement — progress here resets every time, and
 * that is the whole of its meaning (§23.1).
 */

/**
 * Five stages, named rather than numbered.
 *
 * Deliberately unnumbered: the routes' own eyebrows say "Step 1 of 3" for the
 * three setup screens, which is accurate about setup and would contradict a
 * "1 of 5" here. Naming the stages lets both be true at once. Reconciling that
 * copy belongs to the batches that already touch it.
 */
export const FLOW_STEPS = [
  { href: '/park', label: 'Look around' },
  { href: '/confirm', label: 'Confirm' },
  { href: '/setup', label: 'Set up' },
  { href: '/workout', label: 'Train' },
  { href: '/complete', label: 'Done' },
] as const;

export type FlowStep = (typeof FLOW_STEPS)[number];

/** `/park/` and `/park` are the same route. `/` stays `/`. */
export const normalizePath = (pathname: string): string => {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
};

/** Index into FLOW_STEPS, or -1 when the path is not part of the flow. */
export const flowIndexFor = (pathname: string): number => {
  const path = normalizePath(pathname);
  return FLOW_STEPS.findIndex((step) => normalizePath(step.href) === path);
};

export const isFlowRoute = (pathname: string): boolean => flowIndexFor(pathname) >= 0;
