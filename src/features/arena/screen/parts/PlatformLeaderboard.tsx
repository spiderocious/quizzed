import { Repeat, Show } from 'meemaw';

import { Trophy } from '@icons';
import type { Leaderboard } from '@shared/services/platform';
import { cn } from '@shared/utils/cn';

interface PlatformLeaderboardProps {
  board: Leaderboard;
  limit?: number;
}

const DEFAULT_LIMIT = 10;
const PODIUM = ['bg-sun', 'bg-surface', 'bg-accent text-white'];

/** Lagos Life's own leaderboard for this game: the top players, and where you stand. */
export function PlatformLeaderboard({ board, limit = DEFAULT_LIMIT }: PlatformLeaderboardProps) {
  const rows = board.top.slice(0, limit);

  return (
    <section aria-label="Leaderboard" className="w-full rounded-card border-3 border-ink bg-surface p-3 text-ink shadow-pop-sm">
      <h2 className="mb-2 flex items-center gap-2 font-display text-[20px] font-extrabold">
        <Trophy size={20} strokeWidth={3} aria-hidden="true" />
        Top players
      </h2>

      <Show when={rows.length > 0} fallback={<p className="py-3 text-center text-[15px] font-bold text-ink-3">Nobody is on the board yet. Be the first!</p>}>
        <ol className="flex flex-col gap-1.5">
          <Repeat each={rows}>
            {(row) => (
              <li key={`${row.rank}-${row.name}`} className="flex items-center gap-3 rounded-chip bg-canvas-tint px-3 py-1.5">
                <span
                  className={cn(
                    'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink font-display text-[14px] font-extrabold',
                    PODIUM[row.rank - 1] ?? 'bg-canvas-tint',
                  )}
                >
                  {row.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-left font-display text-[17px] font-extrabold">{row.name}</span>
                <span className="font-display text-[17px] font-extrabold">{row.score.toLocaleString()}</span>
              </li>
            )}
          </Repeat>
        </ol>
      </Show>

      <Show when={board.me !== null}>
        <p className="mt-2 rounded-chip border-2 border-ink bg-sun-soft px-3 py-1.5 text-center font-display text-[16px] font-extrabold">
          You: {board.me?.label} · best {board.me?.score.toLocaleString()}
        </p>
      </Show>
    </section>
  );
}
