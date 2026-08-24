/**
 * Choosing which depiction of a movement to show.
 *
 * Shared, and generic over the asset type, because *which* depiction a session
 * gets is a presentation decision both clients must make the same way, while
 * *how* an asset is loaded is bundler semantics that differs between them. The
 * native client binds `require`d images; a web client would bind URLs. Neither
 * binding belongs here, so the asset is a type parameter and this module never
 * touches one.
 *
 * **Two dimensions, and they are not the same dimension.**
 *
 * `SessionPresentation` is which session produced the item — a park session or
 * a substitute one. Theme is the viewer's light or dark UI. They vary
 * independently, and collapsing them would mean a dark-mode user in a park
 * received a depiction chosen for a substitute session.
 *
 * **Neither dimension may change what is claimed.** Environment and theme
 * select between depictions of one movement performed one way. The movement,
 * its phases, its range, and the equipment it needs are fixed by the matrix and
 * the committed instruction, and a variant that changed any of them would be a
 * second claim wearing the first one's key (§8).
 *
 * **`substitute` is not a statement about where the user is.** MoveHere has no
 * indoor venue concept and never asks (§12). A substitute session means the
 * park was withheld — bad conditions, unknown conditions, or nothing confirmed
 * — and the person may be anywhere. Selecting a studio-looking asset for that
 * state is a presentation choice, not an inference that anyone is indoors, and
 * nothing here or downstream may read it as one.
 */

/** Which session produced the item. Not a venue, and not a location claim. */
export type SessionPresentation = 'park' | 'substitute';

/**
 * One depiction, in the themes it is available in.
 *
 * `both` is a deliberate declaration that one rendering reads correctly in
 * either theme, not a placeholder for a dark asset nobody made yet. Making it
 * a distinct shape rather than an optional field keeps that difference visible,
 * and turning it into a themed pair later is a change at one entry.
 */
export type Depiction<A> = { readonly both: A } | { readonly light: A; readonly dark: A };

/**
 * A depiction and the words that stand in for it.
 *
 * `alt` belongs to the composition rather than the entry, because two
 * compositions of one movement can differ in cast and setting. One description
 * covering both would be wrong for at least one of them, and a screen-reader
 * user would be told about an image nobody is showing them.
 */
export interface VisualComposition<A> {
  readonly asset: Depiction<A>;
  readonly alt: string;
}

/**
 * Every depiction of one movement-as-cited.
 *
 * `park` is required and `substitute` is not. A feature-keyed entry has its
 * environment fixed by the basis — a confirmed park bench exists only in a park
 * — so environment is a free dimension for environment-independent movements
 * and for nothing else.
 *
 * `aspectRatio` sits on the entry because for the one movement that has
 * variants it is measured and identical across all of them. If a future
 * movement's compositions differ, it moves onto the composition rather than
 * being averaged into a value true of neither.
 */
export interface VisualEntry<A> {
  readonly park: VisualComposition<A>;
  readonly substitute?: VisualComposition<A>;
  readonly aspectRatio: number;
}

/** What a client renders. One asset, its description, and its true ratio. */
export interface ResolvedVisual<A> {
  readonly source: A;
  readonly alt: string;
  readonly aspectRatio: number;
}

const forTheme = <A>(asset: Depiction<A>, dark: boolean): A =>
  'both' in asset ? asset.both : dark ? asset.dark : asset.light;

/**
 * The depiction for this session and this theme.
 *
 * A `substitute` request against an entry with no substitute composition
 * resolves to the park one. That combination does not arise in shipped content
 * — the substitute pool is environment-independent, and every entry that omits
 * `substitute` is feature-keyed — and the branch exists so this function is
 * total, not as a fallback chain. Showing the movement is better than showing
 * nothing for a case that cannot occur.
 */
export const selectVisual = <A>(
  entry: VisualEntry<A>,
  session: SessionPresentation,
  dark: boolean,
): ResolvedVisual<A> => {
  const composition = session === 'substitute' ? (entry.substitute ?? entry.park) : entry.park;
  return {
    source: forTheme(composition.asset, dark),
    alt: composition.alt,
    aspectRatio: entry.aspectRatio,
  };
};
