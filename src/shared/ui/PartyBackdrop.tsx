import { Repeat } from 'meemaw';
import type { ReactNode } from 'react';


import { cn } from '@shared/utils/cn';

export const BACKDROP = { STAGE: 'stage', CANVAS: 'canvas', BERRY: 'berry', GO: 'go', DANGER: 'danger' } as const;
type Backdrop = (typeof BACKDROP)[keyof typeof BACKDROP];

interface PartyBackdropProps {
  tone?: Backdrop;
  children: ReactNode;
  className?: string;
}

const TONE_CLASS: Record<Backdrop, string> = {
  stage: 'bg-stage text-white dots-light',
  canvas: 'bg-canvas text-ink dots-ink',
  berry: 'bg-berry text-white dots-light',
  go: 'bg-action text-white dots-light',
  danger: 'bg-danger text-white dots-light',
};

// Shapes that drift behind everything. Decorative, so hidden from assistive tech.
const SHAPES = [
  { className: 'left-[6%] top-[12%] h-16 w-16 rounded-full bg-sun', delay: '0s' },
  { className: 'right-[8%] top-[18%] h-12 w-12 rotate-12 rounded-xl bg-bubble', delay: '-3s' },
  { className: 'left-[12%] bottom-[14%] h-10 w-10 rotate-45 rounded-md bg-accent', delay: '-6s' },
  { className: 'right-[14%] bottom-[20%] h-20 w-20 rounded-full bg-sky', delay: '-9s' },
  { className: 'left-[46%] top-[6%] h-8 w-8 rounded-full bg-action', delay: '-4s' },
  { className: 'right-[40%] bottom-[8%] h-9 w-9 rotate-12 rounded-lg bg-sun', delay: '-11s' },
];

/**
 * The room. A full-bleed coloured ground with a dot pattern and a few slow
 * drifting shapes, so even a waiting screen feels alive.
 */
export function PartyBackdrop({ tone = BACKDROP.STAGE, children, className }: PartyBackdropProps) {
  return (
    <div className={cn('relative min-h-full overflow-hidden transition-colors duration-500', TONE_CLASS[tone], className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <Repeat each={SHAPES}>
          {(shape) => (
            <span
              key={shape.className}
              style={{ animationDelay: shape.delay }}
              className={cn('absolute animate-drift border-3 border-ink opacity-45', shape.className)}
            />
          )}
        </Repeat>
      </div>
      <div className="relative z-10 min-h-full">{children}</div>
    </div>
  );
}
