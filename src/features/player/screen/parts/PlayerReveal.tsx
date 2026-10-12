import { Show } from 'meemaw';

import { Flame } from '@icons';
import { ANSWER_RESULT, type QuizView } from '@shared/types/quiz';
import { CountUp } from '@shared/ui/CountUp';

import { ordinal } from '../../helpers/ordinal';

interface PlayerRevealProps {
  game: QuizView;
}

const MS_PER_SECOND = 1000;
const STREAK_WORTH_SHOWING = 2;
const ALONE = 1;

const HEADLINE = {
  [ANSWER_RESULT.CORRECT]: { emoji: '🎉', title: 'Correct!' },
  [ANSWER_RESULT.WRONG]: { emoji: '🙈', title: 'Not quite!' },
  [ANSWER_RESULT.NONE]: { emoji: '⏰', title: 'Too slow!' },
} as const;

/** Right or wrong, how many points, and what the answer was. */
export function PlayerReveal({ game }: PlayerRevealProps) {
  const you = game.you;
  const result = you?.result ?? ANSWER_RESULT.NONE;
  const headline = HEADLINE[result];
  const correct = result === ANSWER_RESULT.CORRECT;
  const answer = game.question !== null && game.reveal !== null ? game.question.options[game.reveal.answer_idx] : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-8 text-center">
      <p className={correct ? 'animate-jelly text-[84px] leading-none' : 'animate-shake text-[84px] leading-none'} aria-hidden="true">
        {headline.emoji}
      </p>
      <h1 className="animate-pop-in text-[52px]">{headline.title}</h1>

      <Show when={correct}>
        <p className="animate-count-pop font-display text-[64px] font-extrabold leading-none text-sun ink-stroke">
          +<CountUp value={you?.points ?? 0} durationMs={700} />
        </p>
        <p className="font-display text-[17px] font-bold">
          <Show when={you?.hinted !== true} fallback="Answer revealed — base points only">
            Answered in {((you?.speed_ms ?? 0) / MS_PER_SECOND).toFixed(1)}s — faster is worth more
          </Show>
        </p>
        <Show when={(you?.streak ?? 0) >= STREAK_WORTH_SHOWING}>
          <p className="inline-flex animate-pop-in items-center gap-2 rounded-full border-3 border-ink bg-accent px-4 py-1.5 font-display text-[20px] font-extrabold text-white shadow-pop-sm">
            <Flame size={22} strokeWidth={3} fill="currentColor" aria-hidden="true" />
            {you?.streak} in a row!
          </p>
        </Show>
      </Show>

      <Show when={answer !== undefined}>
        <div className="max-w-full rounded-card border-3 border-ink bg-surface px-5 py-3 text-ink shadow-pop-sm">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-ink-3">The answer</p>
          <p className="break-words font-display text-[24px] font-extrabold leading-tight">{answer}</p>
        </div>
      </Show>

      <p className="font-display text-[20px] font-extrabold opacity-90">
        <Show when={game.board.length > ALONE} fallback={`Question ${game.question_in_round} of ${game.questions_per_round}`}>
          You’re {ordinal(you?.rank ?? 1)}
        </Show>
      </p>
    </div>
  );
}
