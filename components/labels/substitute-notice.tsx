import { Badge } from '@/components/ui/badge';

/**
 * Substitute-session label (§11).
 *
 * A substitute must never be mistakable for a park session, so it gets its own
 * colour (clay, used nowhere else), its own left rule, and its own heading.
 * The distinction is carried by three signals, not by colour alone.
 *
 * Still not a warning: nothing has gone wrong. The park was unavailable and
 * there is a session anyway.
 */
export function SubstituteNotice({
  reason,
}: {
  readonly reason: string;
}) {
  return (
    <div className="rounded-md border border-ochre border-l-4 bg-ochre-soft px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Badge tone="clay">Substitute session</Badge>
        <p className="text-sm font-medium text-spruce">Not a park session</p>
      </div>
      <p className="mt-2 text-sm text-spruce-muted text-pretty">{reason}</p>
    </div>
  );
}
