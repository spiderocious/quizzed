import { cn } from '@shared/utils/cn';

interface TimerBarProps {
  /** 1 at the start, 0 when time is up. */
  fraction: number;
  secondsLeft: number;
  className?: string;
}

const URGENT_SECONDS = 5;
const WARN_FRACTION = 0.5;

/**
 * The clock for a question. It drains left to right and changes colour as it
 * runs down; in the last five seconds it turns tomato and the number beats.
 */
export function TimerBar({ fraction, secondsLeft, className }: TimerBarProps) {
  const urgent = secondsLeft <= URGENT_SECONDS;
  const fill = urgent ? 'bg-danger' : fraction < WARN_FRACTION ? 'bg-sun' : 'bg-action';

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div
        role="progressbar"
        aria-label="Time left"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
        className="h-7 flex-1 overflow-hidden rounded-full border-3 border-ink bg-white/90"
      >
        <div
          className={cn('h-full rounded-full transition-[width,background-color] duration-150 ease-linear', fill)}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      <span
        className={cn(
          'inline-flex h-16 min-w-16 items-center justify-center rounded-full border-3 border-ink bg-surface px-3 font-display text-[34px] font-extrabold leading-none text-ink shadow-pop-sm',
          urgent && 'animate-heartbeat bg-danger text-white',
        )}
      >
        {secondsLeft}
      </span>
    </div>
  );
}
