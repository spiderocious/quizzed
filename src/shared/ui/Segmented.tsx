import { Repeat } from 'meemaw';
import type { ReactNode } from 'react';


import { SOUND, sound } from '@shared/services/sound';
import { cn } from '@shared/utils/cn';

interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  className?: string;
}

/** A row of choices where exactly one is on. */
export function Segmented<T extends string | number>({ label, value, options, onChange, className }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex flex-wrap gap-2', className)}>
      <Repeat each={options}>
        {(option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                sound.play(SOUND.TAP);
                onChange(option.value);
              }}
              className={cn(
                'h-12 min-w-0 flex-1 whitespace-nowrap rounded-chip border-3 border-ink px-2 font-display text-[17px] font-extrabold transition-transform',
                selected ? 'translate-y-1 bg-stage text-white' : 'bg-surface text-ink shadow-pop-sm hover:bg-canvas-tint',
              )}
            >
              {option.label}
            </button>
          );
        }}
      </Repeat>
    </div>
  );
}
