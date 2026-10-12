import { Minus, Plus } from '@icons';
import { SOUND, sound } from '@shared/services/sound';
import { cn } from '@shared/utils/cn';

interface StepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** A number you nudge up and down. Clamped, so it cannot leave its range. */
export function Stepper({ label, value, min, max, step = 1, onChange, disabled = false }: StepperProps) {
  const nudge = (delta: number): void => {
    sound.play(SOUND.TAP);
    onChange(Math.min(max, Math.max(min, value + delta)));
  };
  const buttonClass =
    'inline-flex h-12 w-12 items-center justify-center rounded-full border-3 border-ink bg-sun text-ink shadow-pop-sm transition-transform active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-40';

  return (
    <div role="group" aria-label={label} className={cn('flex items-center gap-3', disabled && 'opacity-40')}>
      <button type="button" aria-label={`Fewer ${label}`} className={buttonClass} disabled={disabled || value <= min} onClick={() => nudge(-step)}>
        <Minus size={22} strokeWidth={3.5} aria-hidden="true" />
      </button>
      <span aria-live="polite" className="min-w-[64px] text-center font-display text-[44px] font-extrabold leading-none text-ink">
        {value}
      </span>
      <button type="button" aria-label={`More ${label}`} className={buttonClass} disabled={disabled || value >= max} onClick={() => nudge(step)}>
        <Plus size={22} strokeWidth={3.5} aria-hidden="true" />
      </button>
    </div>
  );
}
