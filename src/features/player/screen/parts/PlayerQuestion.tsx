import { Repeat, Show } from 'meemaw';
import { useState } from 'react';


import { useRoomSocket } from '@shared/realtime/room-socket-context';
import { useCountdown } from '@shared/realtime/use-countdown';
import { buzz, SOUND, sound } from '@shared/services/sound';
import { QUIZ_ACTION, type QuizQuestion, type QuizView } from '@shared/types/quiz';
import { answerStyle } from '@shared/ui/answers';
import { cn } from '@shared/utils/cn';

import { usePhonePrefs } from '../../providers/phone-prefs-provider';

interface PlayerQuestionProps {
  game: QuizView;
  question: QuizQuestion;
}

const BUZZ_MS = 30;
const URGENT_SECONDS = 5;
// Past this many characters a prompt drops a size so the answers stay on screen.
const LONG_PROMPT = 90;

/**
 * The controller. Four big buttons that match the four tiles on the big screen
 * by colour, shape and position. With "show questions on my phone" on, the
 * question and the answer text are here too.
 *
 * The choice is shown as locked the instant it is tapped, without waiting for
 * the server: on a slow connection a button that does nothing for half a
 * second gets tapped twice. The server keeps only the first answer either way.
 */
export function PlayerQuestion({ game, question }: PlayerQuestionProps) {
  const { send } = useRoomSocket();
  const { showQuestion } = usePhonePrefs();
  const countdown = useCountdown(game.deadline, game.phase_started_at);
  const [tapped, setTapped] = useState<number | null>(null);

  const chosen = game.you?.choice ?? tapped;
  const locked = chosen !== null;

  const pick = (index: number): void => {
    if (locked) return;
    setTapped(index);
    sound.play(SOUND.LOCK);
    buzz(BUZZ_MS);
    send(QUIZ_ACTION.ANSWER, { question_seq: game.question_seq, choice: index });
  };

  return (
    <div className="safe-bottom flex flex-1 flex-col gap-3 px-4 pb-5 pt-3">
      <div className="flex items-center gap-3">
        <div className="h-4 flex-1 overflow-hidden rounded-full border-3 border-ink bg-white/90">
          <div
            className={cn('h-full rounded-full transition-[width] duration-150 ease-linear', countdown.secondsLeft <= URGENT_SECONDS ? 'bg-danger' : 'bg-action')}
            style={{ width: `${countdown.fraction * 100}%` }}
          />
        </div>
        <span className={cn('min-w-9 text-right font-display text-[24px] font-extrabold leading-none', countdown.secondsLeft <= URGENT_SECONDS && 'animate-heartbeat')}>
          {countdown.secondsLeft}
        </span>
      </div>

      <Show
        when={showQuestion}
        fallback={
          <p className="text-center font-display text-[20px] font-extrabold">
            <Show when={locked} fallback="Look at the big screen and pick!">
              Locked in! ⚡
            </Show>
          </p>
        }
      >
        <div className="animate-slide-up rounded-card border-3 border-ink bg-surface px-4 py-3 text-center text-ink shadow-pop-sm">
          <p className="flex items-center justify-between gap-3 text-[12px] font-extrabold uppercase tracking-[0.1em] text-ink-3">
            <span className="min-w-0 truncate">
              {question.category_emoji} {question.category_label}
            </span>
            <span className="shrink-0 rounded-full bg-canvas-tint px-2 py-0.5 text-ink">
              {game.question_in_round} / {game.questions_per_round}
            </span>
          </p>
          <p data-testid="question-prompt" className={cn('mt-1.5 font-display font-extrabold leading-tight', question.prompt.length > LONG_PROMPT ? 'text-[18px]' : 'text-[22px]')}>{question.prompt}</p>
        </div>
      </Show>

      <div key={game.question_seq} className={cn('grid flex-1 gap-3', showQuestion ? 'grid-cols-1' : 'grid-cols-2')}>
        <Repeat each={question.options}>
          {(option, index) => {
            const style = answerStyle(index);
            const Shape = style.shape;
            const mine = chosen === index;

            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                aria-pressed={mine}
                aria-label={`Answer ${style.letter}: ${option}`}
                onClick={() => pick(index)}
                style={{ ['--i' as string]: index }}
                className={cn(
                  'stagger flex animate-pop-in items-center justify-center gap-3 rounded-card border-3 border-ink shadow-pop transition-all duration-200 active:translate-y-[6px] active:shadow-none',
                  style.bg,
                  style.text,
                  showQuestion ? 'min-h-[60px] justify-start px-4 py-2.5 text-left' : 'min-h-[120px] flex-col',
                  locked && !mine && 'opacity-30 saturate-50',
                  mine && 'translate-y-[6px] animate-jelly shadow-none ring-[5px] ring-white',
                )}
              >
                <Shape className={showQuestion ? 'h-8 w-8 shrink-0' : 'h-16 w-16'} strokeWidth={3} fill="currentColor" aria-hidden="true" />
                <Show when={showQuestion}>
                  <span className="min-w-0 break-words font-display text-[20px] font-extrabold leading-tight">{option}</span>
                </Show>
              </button>
            );
          }}
        </Repeat>
      </div>

      <Show when={locked && showQuestion}>
        <p className="text-center font-display text-[18px] font-extrabold">Locked in! ⚡ Waiting for the others…</p>
      </Show>
    </div>
  );
}
