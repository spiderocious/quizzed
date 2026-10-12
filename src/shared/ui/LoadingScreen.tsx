import { Loader2 } from '@icons';

import { BACKDROP, PartyBackdrop } from './PartyBackdrop';

interface LoadingScreenProps {
  label: string;
}

/** A whole-screen wait. Named, so it says what it is waiting for. */
export function LoadingScreen({ label }: LoadingScreenProps) {
  return (
    <PartyBackdrop tone={BACKDROP.STAGE}>
      <div role="status" aria-live="polite" className="flex min-h-screen flex-col items-center justify-center gap-5 p-8 text-center">
        <Loader2 size={56} strokeWidth={3} className="animate-spin" aria-hidden="true" />
        <p className="font-display text-[28px] font-extrabold">{label}</p>
      </div>
    </PartyBackdrop>
  );
}
