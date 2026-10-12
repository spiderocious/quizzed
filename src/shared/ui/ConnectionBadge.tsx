import { Show } from 'meemaw';

import { WifiOff } from '@icons';
import { CONNECTION, useRoomSocket } from '@shared/realtime/room-socket-context';

/** A banner that appears only while the connection is being re-established. */
export function ConnectionBadge() {
  const { status } = useRoomSocket();

  return (
    <Show when={status === CONNECTION.RECONNECTING}>
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-x-0 top-3 z-50 mx-auto flex w-fit animate-drop-in items-center gap-2 rounded-full border-3 border-ink bg-sun px-4 py-2 font-display text-[16px] font-extrabold text-ink shadow-pop-sm"
      >
        <WifiOff size={18} strokeWidth={3} aria-hidden="true" />
        Reconnecting…
      </div>
    </Show>
  );
}
