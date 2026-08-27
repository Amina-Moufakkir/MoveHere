import {
  lastSevenDays,
  sessionsInWeekOf,
  workoutsThisWeekText,
} from '@/src/domain/activity-window.ts';

/**
 * Have I been training recently?
 *
 * That is the whole question this answers. Not *am I improving* — MoveHere
 * records no load, no completed repetitions and no effort, so improvement has
 * nothing to rest on (§24.11).
 *
 * **A marked date means at least one session was recorded complete on that
 * local calendar date** (Invariant 5). Every mark is identical: same size, same
 * colour, same opacity, regardless of how many sessions the date holds or how
 * long they were. Scaling any of those would smuggle in a claim about quality
 * or intensity that nothing here measures. Two sessions do not make a better
 * day.
 *
 * Unmarked days are simply unmarked. They are never styled as missed, never
 * red, never dimmed toward failure — a calendar reports, and the moment it
 * starts judging it becomes a streak with extra steps.
 *
 * Colour alone carries nothing: every day exposes its state in text to
 * assistive technology, and the marks differ in fill as well as tone.
 */
export function ActivityStrip({
  activityDates,
  today,
}: {
  /** Frozen local dates from Activity records. Never re-derived from a timestamp. */
  readonly activityDates: readonly string[];
  readonly today: string;
}) {
  const days = lastSevenDays(today);
  const marked = new Set(activityDates);
  const count = sessionsInWeekOf(activityDates, today);

  const weekday = (date: string): string => {
    const [y, m, d] = date.split('-').map(Number) as [number, number, number];
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()] ?? '';
  };

  return (
    <div>
      <h2 className="text-marker font-extrabold uppercase tracking-(--text-marker--letter-spacing) text-navy-faint">
        Recent activity
      </h2>

      {/* A strip, not a row of panels. Cells stay compact and left-aligned so
          seven days read as one glance rather than seven empty containers. */}
      <ul className="mt-3 flex items-end gap-1.5 sm:gap-2">
        {days.map((date) => {
          const active = marked.has(date);
          const isToday = date === today;
          return (
            <li key={date} className="flex w-9 flex-col items-center gap-1.5 sm:w-10">
              <span aria-hidden className="text-marker font-bold uppercase text-navy-faint">
                {weekday(date).charAt(0)}
              </span>
              <span
                aria-hidden
                className={[
                  'grid size-9 place-items-center rounded-lg transition-colors sm:size-10',
                  /* Marked and unmarked differ in fill and in border, not in
                     tone alone — and no unmarked day is styled as a failure. */
                  active ? 'bg-pale-green ring-1 ring-green' : 'bg-pale ring-1 ring-line',
                  isToday ? 'outline outline-2 outline-offset-2 outline-line-strong' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {active && <span className="size-2.5 rounded-full bg-green" />}
              </span>
              {/* The state in words, because a mark that only exists as colour
                  is a mark half the audience cannot read. */}
              <span className="sr-only">
                {weekday(date)} {date}
                {isToday ? ', today' : ''}: {active ? 'session recorded' : 'no session recorded'}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-sm font-semibold text-navy-muted">{workoutsThisWeekText(count)}</p>
    </div>
  );
}
