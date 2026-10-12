import { cn } from '@shared/utils/cn';

export const AVATAR_SIZE = { SM: 'sm', MD: 'md', LG: 'lg', XL: 'xl', HUGE: 'huge' } as const;
type AvatarSize = (typeof AVATAR_SIZE)[keyof typeof AVATAR_SIZE];

interface AvatarProps {
  emoji: string;
  size?: AvatarSize;
  /** Dimmed with a dashed edge: the player's phone has dropped off. */
  away?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-9 w-9 text-[20px] border-2',
  md: 'h-12 w-12 text-[28px] border-3',
  lg: 'h-16 w-16 text-[38px] border-3',
  xl: 'h-24 w-24 text-[58px] border-3',
  huge: 'h-36 w-36 text-[88px] border-[4px]',
};

// The plate behind the emoji. Picked from the emoji itself, so a player keeps
// the same colour on every screen without the server having to send one.
const PLATES = ['bg-sun', 'bg-bubble-soft', 'bg-sky', 'bg-accent-soft', 'bg-action-soft', 'bg-berry-soft', 'bg-stage-tint'];

function plateFor(emoji: string): string {
  const code = emoji.codePointAt(0) ?? 0;
  return PLATES[code % PLATES.length] ?? 'bg-sun';
}

export function Avatar({ emoji, size = AVATAR_SIZE.MD, away = false, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full border-ink leading-none',
        plateFor(emoji),
        SIZE_CLASS[size],
        away && 'border-dashed opacity-45 grayscale',
        className,
      )}
    >
      {emoji}
    </span>
  );
}
