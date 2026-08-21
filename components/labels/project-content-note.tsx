/**
 * Project-content provenance label (§8).
 *
 * The wording is shared with the native client and lives in
 * src/presentation/safety-copy.ts. This component owns only how it looks: the
 * same register as a caption — honest, not alarming. It is not a warning, and
 * it must not be styled as one.
 */
import { PROJECT_CONTENT_NOTE } from '@/src/presentation/safety-copy.ts';

export function ProjectContentNote({ className }: { readonly className?: string }) {
  return (
    <p
      className={['flex items-start gap-2 text-sm leading-snug text-navy-muted text-pretty', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current opacity-50" />
      <span>{PROJECT_CONTENT_NOTE}</span>
    </p>
  );
}
