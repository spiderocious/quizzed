import { useEffect, useRef, type ReactNode } from 'react';

import { Card } from './Card';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const TITLE_ID = 'modal-title';

/**
 * A question that must be answered before anything else. It sits over the
 * screen, takes the focus, and closes on Escape or a tap outside — both of
 * which mean "never mind", so a slip can never do the risky thing.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgb(22_59_46/0.72)] p-4 sm:items-center" onClick={onClose}>
      <Card
        big
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="safe-bottom flex w-full max-w-sm animate-slide-up flex-col gap-4 p-5 text-center text-ink outline-none"
      >
        <h2 id={TITLE_ID} className="font-display text-[28px] font-extrabold leading-none">
          {title}
        </h2>
        {children}
      </Card>
    </div>
  );
}
