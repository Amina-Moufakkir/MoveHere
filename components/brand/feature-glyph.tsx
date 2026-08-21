/**
 * Feature pictograms.
 *
 * Rounded joins and open forms to match Open Air's geometry. Drawn on a 24
 * grid but used large — the icon is the primary way a tile is recognised at a
 * glance, so it gets weight and space rather than sitting beside a label.
 */
const PATHS: Record<string, readonly string[]> = {
  'park-bench': ['M3 14h18', 'M3 10h18', 'M6 14v6', 'M18 14v6', 'M5.5 10V8', 'M18.5 10V8'],
  'pull-up-bar': ['M3 6h18', 'M6.5 6v14', 'M17.5 6v14', 'M9.5 6v3.5', 'M14.5 6v3.5'],
  'parallel-bars': ['M3 9h18', 'M3 15h18', 'M6.5 9v11', 'M17.5 9v11'],
  stairs: ['M3 20h4.5v-4.5H12V11h4.5V6.5H21'],
  hill: ['M2 18.5l6.5-9 4 4.5 3.5-4.5 6 9z'],
  'walking-running-path': ['M7 20.5c0-6 10-4.5 10-9s-7-4-7-8'],
  // A single stadium outline with lane ticks. Nested outlines read as an eye
  // at tile size, which is worse than being slightly abstract.
  'running-track': ['M8 6.5h8a5.5 5.5 0 0 1 0 11H8a5.5 5.5 0 0 1 0-11z'],
  'hard-court': ['M3.5 5.5h17v13h-17z', 'M12 5.5v13', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5'],
};

export function FeatureGlyph({ id, className }: { readonly id: string; readonly className?: string }) {
  const paths = PATHS[id] ?? ['M4 12h16'];
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
