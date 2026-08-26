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

/**
 * What the workflow meter is allowed to claim.
 *
 * Progress used to be derived from the pathname alone, which let the meter
 * assert stages nobody had reached: a cold deep link into training announced
 * "Look around (completed), Confirm (completed), Set up (completed)" with no
 * session in existence, and a live session part way through was reported as
 * "Train (not started)" while the user stood on the preparation screen.
 *
 * Two different questions were being answered by one value. **Reached** is a
 * fact about the user's work; **current view** is a fact about where they are
 * standing. Moving backward changes the second and must not erase the first —
 * a stage reported as not-started offers no way back to the session sitting
 * inside it, which is how an in-progress workout got stranded (§24.14).
 */
export type StageState = 'reached' | 'current-view' | 'not-started';

/** The real state the meter may read. Nothing here is derived from a route. */
export interface FlowFacts {
  /** Candidate features have been proposed in this visit. */
  readonly hasCandidates: boolean;
  /** A confirmed inventory exists. */
  readonly hasInventory: boolean;
  /** An unfinished session exists. */
  readonly hasActiveSession: boolean;
  /** A completed record exists for the session just finished. */
  readonly hasCompletedRecord: boolean;
}

/**
 * The furthest stage the user's work has actually reached.
 *
 * Monotonic on purpose: you cannot hold a completed record without having
 * confirmed a park and set up a session, so a later fact implies the earlier
 * stages rather than each stage carrying an independent predicate that can
 * disagree with its neighbours.
 *
 * An **active session reaches Train**, finished or not. That is where the work
 * is, and it is what keeps Train a link back to a session in flight rather than
 * a dead label — the shape the stranding defect took.
 */
const furthestReached = (facts: FlowFacts): number => {
  if (facts.hasCompletedRecord) return 4;
  if (facts.hasActiveSession) return 3;
  if (facts.hasInventory) return 1;
  if (facts.hasCandidates) return 0;
  return -1;
};

/** Whether the user's work has actually reached a stage. */
export const stageReached = (index: number, facts: FlowFacts): boolean =>
  index <= furthestReached(facts);

export const stageStateFor = (index: number, pathname: string, facts: FlowFacts): StageState => {
  if (index === flowIndexFor(pathname)) return 'current-view';
  return stageReached(index, facts) ? 'reached' : 'not-started';
};
