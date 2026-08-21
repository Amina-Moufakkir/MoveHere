/**
 * Project-content provenance label (§8).
 *
 * Persistent but quiet: it stays on screen for the whole session, because a
 * user should never be mid-workout and unaware of what authored the
 * programming. It is set in the same register as a caption — honest, not
 * alarming. It is not a warning, and it must not be styled as one.
 */
export function ProjectContentNote({ className }: { readonly className?: string }) {
  return (
    <p
      className={['flex items-start gap-2 text-sm text-ink-faint text-pretty', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink-faint/60" />
      <span>
        Sessions are built from project-authored training content, not programming reviewed by a
        qualified fitness professional.
      </span>
    </p>
  );
}
