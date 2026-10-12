import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@shared/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Larger radius and a deeper drop-edge, for the hero card of a screen. */
  big?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ children, big = false, className, ...rest }, ref) {
  return (
    <div
      ref={ref}
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
});
