import { Repeat, Show } from 'meemaw';

import { Crown, Flame } from '@icons';
import { ANSWER_RESULT, type BoardRow } from '@shared/types/quiz';
import { cn } from '@shared/utils/cn';

import { Avatar, AVATAR_SIZE } from './Avatar';
import { CountUp } from './CountUp';

export const BOARD_SIZE = { PHONE: 'phone', SCREEN: 'screen' } as const;
type BoardSize = (typeof BOARD_SIZE)[keyof typeof BOARD_SIZE];

interface LeaderboardProps {
  rows: BoardRow[];
  size?: BoardSize;
  /** Show the points just won beside each score. */
  showDelta?: boolean;
  /** Rank by, and display, the round's points instead of the running total. */
  byRound?: boolean;
  highlightId?: string;
  limit?: number;
  className?: string;
}

const ROW_HEIGHT: Record<BoardSize, number> = { phone: 60, screen: 84 };
const ROW_GAP = 10;
const HOT_STREAK = 3;
const FIRST = 0;

const RANK_PLATE = ['bg-sun text-ink', 'bg-surface text-ink', 'bg-accent text-white'];

/**
 * The standings. Rows are positioned by rank and transition between positions,
 * so when someone overtakes, their row physically climbs past the other.
 */
export function Leaderboard({
  rows,
  size = BOARD_SIZE.SCREEN,
  showDelta = false,
  byRound = false,
  highlightId,
  limit,
  className,
}: LeaderboardProps) {
  const ordered = byRound ? [...rows].sort((a, b) => b.round_score - a.round_score || a.rank - b.rank) : rows;
  const visible = limit === undefined ? ordered : ordered.slice(0, limit);
  // Render in a stable order (by id) and move rows with transforms; rendering
  // in rank order would remount them and there would be nothing to animate.
  const stable = [...visible].sort((a, b) => a.player_id.localeCompare(b.player_id));
  const slot = ROW_HEIGHT[size] + ROW_GAP;
  const big = size === BOARD_SIZE.SCREEN;

  return (
    <ol className={cn('relative w-full', className)} style={{ height: Math.max(0, visible.length * slot - ROW_GAP) }}>
      <Repeat each={stable}>
        {(row) => {
          const position = visible.findIndex((r) => r.player_id === row.player_id);
          const points = byRound ? row.round_score : row.score;
          const mine = row.player_id === highlightId;

          return (
            <li
              key={row.player_id}
              style={{ transform: `translateY(${position * slot}px)`, height: ROW_HEIGHT[size] }}
              className={cn(
                'absolute inset-x-0 top-0 flex items-center gap-3 rounded-btn border-3 border-ink bg-surface px-3 text-ink shadow-pop-sm',
                'transition-transform duration-700 ease-[cubic-bezier(0.34,1.3,0.64,1)]',
                big && 'gap-4 px-5',
                mine && 'bg-sun-soft ring-4 ring-sun',
                position === FIRST && !byRound && 'bg-sun-soft',
              )}
            >
              <span
                className={cn(
                  'inline-flex shrink-0 items-center justify-center rounded-full border-3 border-ink font-display font-extrabold leading-none',
                  big ? 'h-12 w-12 text-[26px]' : 'h-9 w-9 text-[18px]',
                  RANK_PLATE[position] ?? 'bg-canvas-tint text-ink',
                )}
              >
                <Show when={position === FIRST} fallback={position + 1}>
                  <Crown size={big ? 24 : 18} strokeWidth={3} aria-label="First place" />
                </Show>
              </span>

              <Avatar emoji={row.avatar} size={big ? AVATAR_SIZE.LG : AVATAR_SIZE.SM} away={!row.connected} />

              <span className={cn('min-w-0 flex-1 truncate font-display font-extrabold', big ? 'text-[34px]' : 'text-[20px]')}>
                {row.name}
              </span>

              <Show when={row.streak >= HOT_STREAK}>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border-2 border-ink bg-accent px-2 py-0.5 font-display font-extrabold text-white',
                    big ? 'text-[20px]' : 'text-[13px]',
                  )}
                >
                  <Flame size={big ? 20 : 14} strokeWidth={3} aria-hidden="true" />
                  {row.streak}
                </span>
              </Show>

              <Show when={showDelta && row.result === ANSWER_RESULT.CORRECT}>
                <span className={cn('animate-pop-in font-display font-extrabold text-action-deep', big ? 'text-[26px]' : 'text-[15px]')}>
                  +{row.delta}
                </span>
              </Show>

              <CountUp
                value={points}
                className={cn('shrink-0 text-right font-display font-extrabold', big ? 'min-w-[130px] text-[38px]' : 'min-w-[70px] text-[22px]')}
              />
            </li>
          );
        }}
      </Repeat>
    </ol>
  );
}
