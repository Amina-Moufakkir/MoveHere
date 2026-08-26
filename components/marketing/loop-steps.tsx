import { Icon } from '@/components/brand/icon';
import type { MarketingGlyph } from '@/src/presentation/feature-glyphs.ts';

/**
 * The product loop, named rather than explained.
 *
 * Four compact marks in the hero. **This row is How It Works** — it carries the
 * `#how-it-works` id, and both the header link and the secondary CTA resolve
 * here. There is no second numbered section below: the anchor has none, and a
 * separate one restated these four labels at roughly three times the vertical
 * cost.
 *
 * The first label is "Confirm what's available" and never "Scan" — vision is
 * not implemented, and the word would promise a camera the product does not use.
 */
const STEPS: readonly { readonly label: string; readonly icon: MarketingGlyph }[] = [
  { label: 'Confirm what’s available', icon: 'confirm' },
  { label: 'Choose your time & goal', icon: 'time' },
  { label: 'Get a workout that fits', icon: 'workout' },
  { label: 'Train & complete', icon: 'complete' },
];

export function LoopSteps({ id }: { readonly id?: string }) {
  return (
    <ul id={id} className="grid grid-cols-2 gap-x-6 gap-y-5 scroll-mt-28 sm:grid-cols-4 sm:gap-x-4">
      {STEPS.map((step) => (
        <li key={step.label} className="flex flex-col gap-2.5">
          <Icon name={step.icon} className="text-park" />
          <span className="text-[0.9375rem] font-bold leading-snug text-navy text-pretty">
            {step.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
