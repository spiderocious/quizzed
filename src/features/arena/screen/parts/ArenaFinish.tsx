import { Show } from 'meemaw';
import { useNavigate } from 'react-router-dom';

import { Home, RotateCcw, Settings2 } from '@icons';
import { PATHS } from '@shared/constants/routes';
import { CLIENT_MESSAGE } from '@shared/realtime/protocol';
import { useRoomSocket } from '@shared/realtime/room-socket-context';
import { PLATFORM_KIND } from '@shared/services/platform';
import type { QuizView } from '@shared/types/quiz';
import { Button, BUTTON_SIZE, BUTTON_VARIANT } from '@shared/ui/Button';

import { useLeaderboard } from '../../api/use-leaderboard';
import { usePlatformIdentity } from '../../api/use-platform-identity';
import { ARENA_MODE, type ArenaMode } from '../../arena.types';
import { SUBMISSION, useScoreSubmission } from '../../utils/use-score-submission';

import { PlatformLeaderboard } from './PlatformLeaderboard';

interface ArenaFinishProps {
  mode: ArenaMode;
  game: QuizView;
  myId: string;
}

const FIRST = 1;

function duelVerdict(game: QuizView, myId: string): string {
  const board = game.board;
  const top = board[0];
  const second = board[1];
  // A tie for first is a draw: every stake goes back.
  if (top !== undefined && second !== undefined && top.score === second.score) return '🤝 It’s a draw — stakes returned';
  return top?.player_id === myId ? '🏆 You won the match!' : `${top?.name ?? 'Your opponent'} won this one`;
}

/** What follows a finished run: where it put you, and what to do next. */
export function ArenaFinish({ mode, game, myId }: ArenaFinishProps) {
  const navigate = useNavigate();
  const { send } = useRoomSocket();
  const identity = usePlatformIdentity();
  const onPlatform = identity.data?.kind === PLATFORM_KIND.LIVE;
  const solo = mode === ARENA_MODE.SOLO;

  // Only solo runs go on the leaderboard: a duel is settled between its players.
  const submission = useScoreSubmission(game, solo && onPlatform);
  const board = useLeaderboard(solo && onPlatform && submission !== SUBMISSION.SENDING);
  const rank = game.you?.rank ?? FIRST;

  return (
    <div className="flex w-full flex-1 flex-col items-center gap-4">
      <Show when={!solo}>
        <p className="rounded-full border-3 border-ink bg-sun px-5 py-2 font-display text-[20px] font-extrabold text-ink shadow-pop-sm">
          {duelVerdict(game, myId)}
        </p>
        <p className="font-display text-[16px] font-bold opacity-90">
          <Show when={rank === FIRST} fallback="Lagos Life settles the match from here.">
            Lagos Life pays out the match from here.
          </Show>
        </p>
      </Show>

      <Show when={solo && onPlatform}>
        <p role="status" className="font-display text-[16px] font-bold opacity-90">
          <Show when={submission === SUBMISSION.SAVED}>Score sent to the leaderboard ✓</Show>
          <Show when={submission === SUBMISSION.SENDING}>Sending your score…</Show>
          <Show when={submission === SUBMISSION.FAILED}>Your score could not be sent this time.</Show>
        </p>
        <Show when={board.data !== undefined}>{board.data === undefined ? null : <PlatformLeaderboard board={board.data} />}</Show>
      </Show>

      <div className="mt-auto flex w-full max-w-sm flex-col gap-3">
        <Show when={solo}>
          <Button size={BUTTON_SIZE.LG} icon={<RotateCcw size={22} strokeWidth={3} aria-hidden="true" />} onClick={() => send(CLIENT_MESSAGE.HOST_PLAY_AGAIN)}>
            Play again
          </Button>
        </Show>
        <Show when={!solo}>
          <Button size={BUTTON_SIZE.LG} onClick={() => navigate(PATHS.duel)}>
            Another match
          </Button>
        </Show>
        <div className="flex gap-3">
          <Show when={solo}>
            <Button variant={BUTTON_VARIANT.PLAIN} className="flex-1 px-2" icon={<Settings2 size={18} strokeWidth={3} aria-hidden="true" />} onClick={() => navigate(PATHS.solo)}>
              Settings
            </Button>
          </Show>
          <Button variant={BUTTON_VARIANT.PLAIN} className="flex-1 px-2" icon={<Home size={18} strokeWidth={3} aria-hidden="true" />} onClick={() => navigate(PATHS.home)}>
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
