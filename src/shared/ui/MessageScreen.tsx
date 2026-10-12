import type { ReactNode } from 'react';

import { Card } from './Card';
import { BACKDROP, PartyBackdrop } from './PartyBackdrop';

interface MessageScreenProps {
  emoji: string;
  title: string;
  /** Rendered verbatim: when it came from the server, it is the server's copy. */
  message: string;
  action?: ReactNode;
  tone?: (typeof BACKDROP)[keyof typeof BACKDROP];
}

/** A whole-screen dead end with one way out: room closed, room not found. */
export function MessageScreen({ emoji, title, message, action, tone = BACKDROP.CANVAS }: MessageScreenProps) {
  return (
    <PartyBackdrop tone={tone}>
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card big className="flex w-full max-w-lg animate-pop-in flex-col items-center gap-5 p-8 text-center text-ink">
          <span className="animate-bob text-[84px] leading-none" aria-hidden="true">
            {emoji}
          </span>
          <h1 className="text-[40px]">{title}</h1>
          <p className="max-w-[34ch] text-[18px] font-semibold text-ink-3">{message}</p>
          {action}
        </Card>
      </div>
    </PartyBackdrop>
  );
}
