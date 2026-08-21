/**
 * Session progress.
 *
 * Announced as a progressbar with an accessible label, and the numbers are
 * also visible in text — a bar alone tells a screen-reader user nothing, and
 * tells a sighted user less than it thinks.
 */
export function Progress({
  value,
  total,
  label,
}: {
  readonly value: number;
  readonly total: number;
  readonly label: string;
}) {
  const clamped = Math.max(0, Math.min(value, total));
  const percent = total === 0 ? 0 : Math.round((clamped / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between text-label">
        <span className="font-medium text-spruce-muted">{label}</span>
        <span className="tabular-nums text-spruce-faint">
          {clamped} of {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={label}
        className="h-1.5 overflow-hidden rounded-full bg-chalk-deep"
      >
        <div
          className="h-full rounded-full bg-persimmon-deep transition-[width] duration-(--duration-settle) ease-(--ease-out-soft)"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
