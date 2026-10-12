import { Show } from 'meemaw';

import { X, Zap } from '@icons';
import type { RoomPlayer } from '@shared/realtime/protocol';
import type { QuizView } from '@shared/types/quiz';
import { Avatar, AVATAR_SIZE } from '@shared/ui/Avatar';
import { CountUp } from '@shared/ui/CountUp';
import { SoundToggle } from '@shared/ui/SoundToggle';

import { formatMultiplier } from '../../helpers/multiplier';

interface ArenaHeaderProps {
  me: RoomPlayer;
  game: QuizView | null;
  onLeave: () => void;
}

/** Who you are, your score, what your points are worth, and the way out. */
export function ArenaHeader({ me, game, onLeave }: ArenaHeaderProps) {
  return (
    <header className="safe-top flex items-center gap-2.5 px-4 pt-4">
      <Avatar emoji={me.avatar} size={AVATAR_SIZE.MD} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[20px] font-extrabold leading-none">{me.name}</p>
        <Show when={game !== null}>
          <p className="flex items-center gap-2 whitespace-nowrap font-display text-[15px] font-bold opacity-90">
            <span>
              <CountUp value={game?.you?.score ?? 0} /> pts
            </span>
            <span className="hidden items-center gap-0.5 rounded-full border-2 border-white/50 px-1.5 text-[12px] min-[360px]:inline-flex">
              <Zap size={11} strokeWidth={3} fill="currentColor" aria-hidden="true" />
              {formatMultiplier(game?.multiplier_pct ?? 100)}
            </span>
          </p>
        </Show>
      </div>
      <SoundToggle />
      <button
        type="button"
        onClick={onLeave}
        aria-label="Leave the game"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border-3 border-ink bg-surface text-ink shadow-pop-sm transition-transform active:translate-y-1 active:shadow-none"
      >
        <X size={20} strokeWidth={3} aria-hidden="true" />
      </button>
    </header>
  );
}
