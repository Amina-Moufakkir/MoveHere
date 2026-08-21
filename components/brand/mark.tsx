/**
 * The MoveHere mark: a sun clearing a horizon.
 *
 * Two geometric shapes, no illustration. Blue for the sky the product sends
 * you into, green for the ground you stand on. Reads at 20px.
 */
export function Mark({ size = 22 }: { readonly size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path d="M4 15a8 8 0 0 1 16 0Z" className="fill-blue" />
      <rect x="2" y="17" width="20" height="3.5" rx="1.75" className="fill-green" />
    </svg>
  );
}
