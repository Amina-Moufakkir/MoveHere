/**
 * Calendar windows over recorded activity.
 *
 * Every function here reads the **frozen `localDate`** each record carries, and
 * never reinterprets `completedAt` into a current timezone (§24.9, Invariant 4).
 * That is the whole point of freezing the date: history stays put when the user
 * travels. A Sunday-evening session must not become Monday's because a plane
 * landed somewhere east.
 *
 * The caller supplies today's local date. No clock is read here, for the same
 * reason no clock is read in the confirmation boundary or the seed: shared
 * source that quietly reads one is a hidden dependency in the same tree as the
 * deterministic generator.
 *
 * Dates are handled as `YYYY-MM-DD` strings and compared lexicographically,
 * which is correct for that format and avoids constructing local `Date` values
 * whose meaning would depend on where the code runs. Where arithmetic is
 * genuinely needed it goes through UTC, so a day step is always 24 hours.
 */

/** `YYYY-MM-DD`. The only date shape this module accepts or returns. */
export type LocalDate = string;

const isLocalDate = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

const toUtc = (date: LocalDate): number => {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
};

const fromUtc = (ms: number): LocalDate => {
  const d = new Date(ms);
  return [
    String(d.getUTCFullYear()).padStart(4, '0'),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
};

const DAY = 86_400_000;

/** Adds whole days. Negative steps go backwards. */
export const addDays = (date: LocalDate, days: number): LocalDate =>
  fromUtc(toUtc(date) + days * DAY);

/**
 * The Monday that starts this date's week.
 *
 * **ISO 8601, fixed** (§24.9). Not locale-derived: the same history must not
 * produce different counts on different devices, and a week whose start moves
 * with the reader is not a definition.
 */
export const weekStart = (date: LocalDate): LocalDate => {
  const day = new Date(toUtc(date)).getUTCDay(); // 0 = Sunday
  const backToMonday = day === 0 ? 6 : day - 1;
  return addDays(date, -backToMonday);
};

/** Monday through Sunday inclusive, containing `date`. */
export const weekWindow = (date: LocalDate): { readonly start: LocalDate; readonly end: LocalDate } => {
  const start = weekStart(date);
  return { start, end: addDays(start, 6) };
};

/** Whether a recorded date falls in the calendar week containing `today`. */
export const isInWeekOf = (recorded: LocalDate, today: LocalDate): boolean => {
  if (!isLocalDate(recorded) || !isLocalDate(today)) return false;
  const { start, end } = weekWindow(today);
  return recorded >= start && recorded <= end;
};

/** The seven local dates ending at `today`, oldest first. */
export const lastSevenDays = (today: LocalDate): readonly LocalDate[] =>
  Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

/**
 * Counts completed sessions in the current week.
 *
 * Multiple sessions on one date each count (§24.9). The number is a count of
 * records, not of days.
 */
export const sessionsInWeekOf = (
  dates: readonly LocalDate[],
  today: LocalDate,
): number => dates.filter((d) => isInWeekOf(d, today)).length;

/**
 * The set of dates that hold at least one record.
 *
 * **This is the whole semantic of a calendar mark** (§24.9, Invariant 5): a
 * marked date means at least one session was recorded complete on that local
 * date. Not how many, not how long, not how hard. The count for a date belongs
 * in that date's detail, and nothing here may be scaled by it.
 */
export const datesWithActivity = (dates: readonly LocalDate[]): ReadonlySet<LocalDate> =>
  new Set(dates.filter(isLocalDate));

/** "1 completed session this week" / "3 completed sessions this week". */
export const sessionsThisWeekText = (count: number): string =>
  `${count} completed session${count === 1 ? '' : 's'} this week`;
