import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';

import { SOUND, sound } from '@shared/services/sound';
import { cn } from '@shared/utils/cn';

export const BUTTON_VARIANT = {
  GO: 'go',
  STAGE: 'stage',
  SUN: 'sun',
  PLAIN: 'plain',
  DANGER: 'danger',
} as const;
type ButtonVariant = (typeof BUTTON_VARIANT)[keyof typeof BUTTON_VARIANT];

export const BUTTON_SIZE = { SM: 'sm', MD: 'md', LG: 'lg', XL: 'xl' } as const;
type ButtonSize = (typeof BUTTON_SIZE)[keyof typeof BUTTON_SIZE];

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  go: 'bg-action text-white hover:bg-action-deep',
  stage: 'bg-stage text-white hover:bg-stage-deep',
  sun: 'bg-sun text-ink hover:bg-sun-deep',
  plain: 'bg-surface text-ink hover:bg-canvas-tint',
  danger: 'bg-danger text-white hover:bg-danger-deep',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-[15px] rounded-chip shadow-pop-sm active:translate-y-1',
  md: 'h-12 px-5 text-[17px] shadow-pop-sm active:translate-y-1',
  lg: 'h-14 px-7 text-[20px] shadow-pop active:translate-y-[6px]',
  xl: 'h-[72px] px-10 text-[26px] shadow-pop-lg active:translate-y-[10px]',
};

/**
 * The one button. It sits on a solid drop-edge and presses INTO it: on :active
 * it travels exactly the depth of its shadow and the shadow disappears. That
 * press is the system's signature piece of physicality.
 */
export function Button({
  variant = BUTTON_VARIANT.GO,
  size = BUTTON_SIZE.MD,
  icon,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    sound.play(SOUND.TAP);
    onClick?.(event);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-btn border-3 border-ink font-display font-extrabold leading-none',
        'transition-[transform,box-shadow,background-color] duration-100 active:shadow-none',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
