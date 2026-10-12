import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Larger radius and a deeper drop-edge, for the hero card of a screen. */
  big?: boolean;
}

export function Card({ children, big = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'border-3 border-ink bg-surface',
        big ? 'rounded-stage shadow-pop-lg' : 'rounded-card shadow-pop',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
