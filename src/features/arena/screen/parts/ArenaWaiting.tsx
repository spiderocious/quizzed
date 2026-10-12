import { Repeat, Show } from 'meemaw';

import { Play } from '@icons';
import type { RoomPlayer } from '@shared/realtime/protocol';
import { Avatar, AVATAR_SIZE } from '@shared/ui/Avatar';
import { Button, BUTTON_SIZE } from '@shared/ui/Button';

/** Present where the players start the game themselves: a duel. */
export interface StartControl {
  /** This phone holds the Start button. */
  mine: boolean;
  /** Enough players are seated for Start to work. */
  ready: boolean;
  starterName: string;
  onStart: () => void;
}

interface ArenaWaitingProps {
  title: string;
  hint: string;
  players: RoomPlayer[];
  start?: StartControl;
}

const hintClass = 'max-w-full rounded-full border-3 border-ink bg-sun px-5 py-2 font-display text-[17px] font-extrabold text-ink shadow-pop-sm';

/** The beat before the first question: who is here, and what we are waiting for. */
export function ArenaWaiting({ title, hint, players, start }: ArenaWaitingProps) {
  return (
    <div className="safe-bottom flex flex-1 flex-col items-center justify-center gap-5 px-5 pb-6 text-center">
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

      <Show when={start !== undefined} fallback={<p className={`animate-wiggle ${hintClass}`}>{hint}</p>}>
        <Show
          when={start?.mine === true}
          fallback={
            <p className={`animate-wiggle ${hintClass}`}>
              <Show when={start?.starterName !== ''} fallback="Waiting for players…">
                Waiting for {start?.starterName} to start…
              </Show>
            </p>
          }
        >
          <div className="flex w-full max-w-sm flex-col gap-3">
            <Button size={BUTTON_SIZE.XL} disabled={start?.ready !== true} icon={<Play size={26} strokeWidth={3} fill="currentColor" aria-hidden="true" />} onClick={start?.onStart}>
              Start match
            </Button>
            <p className="font-display text-[16px] font-bold opacity-90">
              <Show when={start?.ready === true} fallback="You’re first in. Start unlocks when another player joins.">
                Everyone here? You start the match.
              </Show>
            </p>
          </div>
        </Show>
      </Show>
    </div>
  );
}
