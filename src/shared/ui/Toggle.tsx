import { SOUND, sound } from '@shared/services/sound';
import { cn } from '@shared/utils/cn';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function Toggle({ label, checked, onChange, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        sound.play(SOUND.TAP);
        onChange(!checked);
      }}
      className={cn(
        'relative h-10 w-[72px] shrink-0 rounded-full border-3 border-ink transition-colors',
        checked ? 'bg-action' : 'bg-ink-5',
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-7 w-7 rounded-full border-3 border-ink bg-surface transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          checked && 'translate-x-8',
        )}
      />
    </button>
  );
}
