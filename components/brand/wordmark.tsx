import { Mark } from '@/components/brand/mark';

/** Name set tight and confident, with the sunrise mark leading. */
export function Wordmark({ size = 'md' }: { readonly size?: 'md' | 'lg' }) {
  return (
    <span className="flex items-center gap-2">
      <Mark size={size === 'lg' ? 28 : 22} />
      <span
        className={`font-extrabold tracking-[-0.03em] text-navy ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}
      >
        MoveHere
      </span>
    </span>
  );
}
