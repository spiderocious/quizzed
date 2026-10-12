import { Repeat } from 'meemaw';

import { cn } from '@shared/utils/cn';

export const LOGO_SIZE = { SM: 'sm', MD: 'md', LG: 'lg' } as const;
type LogoSize = (typeof LOGO_SIZE)[keyof typeof LOGO_SIZE];

interface LogoProps {
  size?: LogoSize;
  className?: string;
}

const TILE_CLASS: Record<LogoSize, string> = {
  sm: 'h-7 min-w-7 px-1 text-[18px] border-2 rounded-lg shadow-[0_3px_0_0_var(--ink)]',
  // Seven tiles in one row: sized off the viewport so they fit a 320px phone.
  md: 'h-[clamp(34px,11vw,52px)] min-w-[clamp(34px,11vw,52px)] px-1 text-[clamp(24px,7.8vw,36px)] border-3 rounded-xl shadow-pop-sm',
  lg: 'h-[clamp(56px,9vw,104px)] min-w-[clamp(56px,9vw,104px)] px-2 text-[clamp(38px,6.4vw,74px)] border-3 rounded-[22px] shadow-pop',
};

const WORDS = ['QUIZZED'] as const;
// Each letter is its own sticker: a colour and a slight tilt, cycled.
const TILES = [
  'bg-sun text-ink -rotate-3',
  'bg-bubble text-white rotate-2',
  'bg-action text-white -rotate-2',
  'bg-accent text-white rotate-3',
  'bg-sky text-ink -rotate-1',
  'bg-surface text-ink rotate-2',
];

/** The wordmark: letter stickers, slightly crooked, like a fridge door. */
export function Logo({ size = LOGO_SIZE.MD, className }: LogoProps) {
  return (
    <div role="img" aria-label="Quizzed" className={cn('inline-flex flex-col items-center gap-[0.35em]', className)}>
      <Repeat each={[...WORDS]}>
        {(word, wordIndex) => (
          <span key={word} className="flex gap-[0.18em]" aria-hidden="true">
            <Repeat each={word.split('')}>
              {(letter, index) => (
                <span
                  key={`${word}-${index}`}
                  className={cn(
                    'inline-flex items-center justify-center border-ink font-display font-extrabold leading-none',
                    TILE_CLASS[size],
                    TILES[(index + wordIndex * 2) % TILES.length],
                  )}
                >
                  {letter}
                </span>
              )}
            </Repeat>
          </span>
        )}
      </Repeat>
    </div>
  );
}
