import type { ReactNode } from 'react';

import { cn } from '@shared/utils/cn';

export const PILL_TONE = {
  INK: 'ink',
  STAGE: 'stage',
  GO: 'go',
  SUN: 'sun',
  ACCENT: 'accent',
  BERRY: 'berry',
  BUBBLE: 'bubble',
  DANGER: 'danger',
  GHOST: 'ghost',
} as const;
type PillTone = (typeof PILL_TONE)[keyof typeof PILL_TONE];

interface PillProps {
  tone?: PillTone;
  children: ReactNode;
  className?: string;
}

const TONE_CLASS: Record<PillTone, string> = {
  ink: 'bg-ink text-white border-ink',
  stage: 'bg-stage text-white border-ink',
  go: 'bg-action text-white border-ink',
  sun: 'bg-sun text-ink border-ink',
  accent: 'bg-accent text-white border-ink',
  berry: 'bg-berry text-white border-ink',
  bubble: 'bg-bubble text-white border-ink',
  danger: 'bg-danger text-white border-ink',
  ghost: 'bg-white/15 text-white border-white/40',
};

export function Pill({ tone = PILL_TONE.INK, children, className }: PillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 font-sans text-[13px] font-extrabold uppercase tracking-[0.08em]',
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
