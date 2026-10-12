import { Show } from 'meemaw';

import type { QuizView } from '@shared/types/quiz';

interface PlayerIntroProps {
  game: QuizView;
}

const SINGLE_ROUND = 1;

/** The beat before the first question. A one-round game has no round to announce. */
export function PlayerIntro({ game }: PlayerIntroProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-10 text-center">
      <p className="animate-wiggle text-[72px] leading-none" aria-hidden="true">
        👀
      </p>
      <h1 className="animate-drop-in text-[56px]">
        <Show when={game.total_rounds !== SINGLE_ROUND} fallback="Get set!">
          Round {game.round}
        </Show>
      </h1>
      <p className="rounded-full border-3 border-ink bg-sun px-5 py-2 font-display text-[18px] font-extrabold text-ink shadow-pop-sm">
        {game.questions_per_round} questions · thumbs ready
      </p>
    </div>
  );
}
