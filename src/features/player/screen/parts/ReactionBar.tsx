import { Repeat } from 'meemaw';

import { CLIENT_MESSAGE, REACTIONS } from '@shared/realtime/protocol';
import { useRoomSocket } from '@shared/realtime/room-socket-context';
import { buzz, SOUND, sound } from '@shared/services/sound';

const BUZZ_MS = 15;

/** Throw an emoji at the big screen. Mash away — the server drops the excess. */
export function ReactionBar() {
  const { send } = useRoomSocket();

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] opacity-80">Send to the big screen</p>
      <div className="flex gap-2">
        <Repeat each={[...REACTIONS]}>
          {(emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Send ${emoji}`}
              onClick={() => {
                sound.play(SOUND.REACT);
                buzz(BUZZ_MS);
                send(CLIENT_MESSAGE.PLAYER_REACT, { emoji });
              }}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border-3 border-ink bg-surface text-[26px] leading-none shadow-pop-sm transition-transform active:translate-y-1 active:scale-125 active:shadow-none"
            >
              {emoji}
            </button>
          )}
        </Repeat>
      </div>
    </div>
  );
}
