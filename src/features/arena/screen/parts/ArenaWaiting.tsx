import { Repeat } from 'meemaw';

import type { RoomPlayer } from '@shared/realtime/protocol';
import { Avatar, AVATAR_SIZE } from '@shared/ui/Avatar';

interface ArenaWaitingProps {
  title: string;
  hint: string;
  players: RoomPlayer[];
}

/** The beat before the first question: who is here, and what we are waiting for. */
export function ArenaWaiting({ title, hint, players }: ArenaWaitingProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 text-center">
      <h1 className="animate-pop-in text-[44px]">{title}</h1>
      <ul className="flex flex-wrap justify-center gap-3">
        <Repeat each={players}>
          {(player) => (
            <li key={player.id} className="flex animate-pop-in flex-col items-center gap-1">
              <Avatar emoji={player.avatar} size={AVATAR_SIZE.XL} away={!player.connected} className="animate-bob" />
              <span className="font-display text-[18px] font-extrabold">{player.name}</span>
            </li>
          )}
        </Repeat>
      </ul>
      <p className="animate-wiggle max-w-full rounded-full border-3 border-ink bg-sun px-5 py-2 font-display text-[17px] font-extrabold text-ink shadow-pop-sm">{hint}</p>
    </div>
  );
}
