/**
 * Feature pictograms, native.
 *
 * The path data is copied verbatim from the web client's FeatureGlyph. SVG path
 * strings are pure data and render identically in react-native-svg, so the two
 * clients draw the same marks — which matters, because the icon is the primary
 * way a tile is recognised at a glance.
 *
 * Copied rather than shared for now, on the same reasoning as the tokens: this
 * is the second consumer, and it is worth seeing what actually carries before
 * abstracting. If /confirm wants these too, they are the strongest candidate in
 * the repository for promotion to src/presentation — identical data, zero
 * platform surface, and a drift here would mean the two clients depict the same
 * feature differently.
 */
import Svg, { Path } from 'react-native-svg';

const PATHS: Record<string, readonly string[]> = {
  'park-bench': ['M3 14h18', 'M3 10h18', 'M6 14v6', 'M18 14v6', 'M5.5 10V8', 'M18.5 10V8'],
  'pull-up-bar': ['M3 6h18', 'M6.5 6v14', 'M17.5 6v14', 'M9.5 6v3.5', 'M14.5 6v3.5'],
  'parallel-bars': ['M3 9h18', 'M3 15h18', 'M6.5 9v11', 'M17.5 9v11'],
  stairs: ['M3 20h4.5v-4.5H12V11h4.5V6.5H21'],
  hill: ['M2 18.5l6.5-9 4 4.5 3.5-4.5 6 9z'],
  'walking-running-path': ['M7 20.5c0-6 10-4.5 10-9s-7-4-7-8'],
  'running-track': ['M8 6.5h8a5.5 5.5 0 0 1 0 11H8a5.5 5.5 0 0 1 0-11z'],
  'hard-court': ['M3.5 5.5h17v13h-17z', 'M12 5.5v13', 'M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5'],
};

export function FeatureGlyph({
  id,
  size,
  color,
}: {
  readonly id: string;
  readonly size: number;
  readonly color: string;
}) {
  const paths = PATHS[id] ?? ['M4 12h16'];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {paths.map((d) => (
        <Path
          key={d}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}

/** The confirmation tick inside a selected tile's marker. */
export function CheckGlyph({ size, color }: { readonly size: number; readonly color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        d="M4.5 10.5l3.5 3.5 7.5-8"
        fill="none"
        stroke={color}
        strokeWidth={2.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
