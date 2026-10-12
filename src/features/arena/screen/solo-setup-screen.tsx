import { Show } from 'meemaw';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ArrowLeft, Play, Zap } from '@icons';
import { GAME_ID } from '@shared/constants/game-ids';
import { PATHS } from '@shared/constants/routes';
import { sessionStore } from '@shared/services/session-store';
import { DIFFICULTY, PACING, type Difficulty, type QuizConfig } from '@shared/types/quiz';
import { Button, BUTTON_SIZE } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { InlineError } from '@shared/ui/InlineError';
import { LoadingScreen } from '@shared/ui/LoadingScreen';
import { MessageScreen } from '@shared/ui/MessageScreen';
import { BACKDROP, PartyBackdrop } from '@shared/ui/PartyBackdrop';
import { Segmented } from '@shared/ui/Segmented';

import { useGameOptions } from '../api/use-game-options';
import { useStartSolo } from '../api/use-start-solo';
import { countMatching } from '../helpers/count-matching';
import { formatMultiplier, multiplierPct } from '../helpers/multiplier';
import { CategoryPicker } from '../widgets/CategoryPicker';

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  [DIFFICULTY.EASY]: '🐣 Easy',
  [DIFFICULTY.MEDIUM]: '🤓 Medium',
  [DIFFICULTY.HARD]: '🧨 Hard',
  [DIFFICULTY.MIXED]: '🎲 Mixed',
};
// A solo run is always this long, so every score is out of the same number.
const SOLO_QUESTIONS = 10;

/**
 * Three choices, then play: how hard, what about, how fast. The run itself is
 * a fixed ten questions, which is what makes one score comparable with another.
 */
export default function SoloSetupScreen() {
  const navigate = useNavigate();
  const options = useGameOptions(GAME_ID.QUIZ);
  const start = useStartSolo();
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTY.MIXED);
  const [categories, setCategories] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(15);

  if (options.isPending) return <LoadingScreen label="Getting the questions ready…" />;
  if (options.isError) {
    return <MessageScreen emoji="🤷" title="Can’t load that" message={options.error.message} action={<Link to={PATHS.home} className="font-display text-[20px] font-extrabold text-stage underline">Back</Link>} />;
  }

  const config: QuizConfig = {
    difficulty,
    categories,
    seconds_per_question: seconds,
    rounds: 1,
    questions_per_round: SOLO_QUESTIONS,
    endless: false,
    pacing: PACING.AUTO,
  };
  const matching = countMatching(options.data.options.categories, config);
  const ready = matching > 0 && !start.isPending;

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (!ready) return;
    start.mutate(config, {
      onSuccess: (seat) => {
        sessionStore.setSeat(seat.code, { playerId: seat.player_id, token: seat.player_token, name: seat.name, avatar: seat.avatar });
        navigate(PATHS.soloPlay(seat.code));
      },
    });
  };

  // A topic with nothing in the bank is not a choice, so it is not shown.
  const playable = options.data.options.categories.filter((category) => category.total > 0);

  return (
    <PartyBackdrop tone={BACKDROP.CANVAS}>
      {/* The bottom padding is the height of the floating bar, so the last topic can scroll clear of it. */}
      <form onSubmit={submit} className="safe-top mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col gap-4 px-4 pb-44 pt-4">
        <header className="flex items-center gap-3">
          <Link
            to={PATHS.home}
            aria-label="Back"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-surface text-ink shadow-pop-sm transition-transform active:translate-y-1 active:shadow-none"
          >
            <ArrowLeft size={20} strokeWidth={3} aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[30px] leading-none">Solo run</h1>
            <p className="mt-1 text-[14px] font-bold text-ink-3">{SOLO_QUESTIONS} questions. Be right, be quick.</p>
          </div>
        </header>

        <Card className="flex flex-col gap-4 p-4">
          <section className="flex flex-col gap-2">
            <h2 className="font-display text-[19px] font-extrabold">How hard?</h2>
            <Segmented
              label="Difficulty"
              value={difficulty}
              options={options.data.options.difficulties.map((d) => ({ value: d, label: DIFFICULTY_LABEL[d] }))}
              onChange={setDifficulty}
              className="grid grid-cols-2"
            />
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-display text-[19px] font-extrabold">How fast?</h2>
            <Segmented
              label="Seconds per question"
              value={seconds}
              options={options.data.options.seconds_choices.map((s) => ({ value: s, label: `${s}s` }))}
              onChange={setSeconds}
              className="grid grid-cols-4"
            />
          </section>
        </Card>

        <Card className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-[19px] font-extrabold">What about?</h2>
            <Show
              when={categories.length > 0}
              fallback={<span className="rounded-full bg-canvas-tint px-3 py-1 text-[13px] font-extrabold text-ink-3">All {playable.length} topics</span>}
            >
              <button type="button" onClick={() => setCategories([])} className="rounded-full border-2 border-ink bg-sun px-3 py-1 text-[13px] font-extrabold text-ink">
                {categories.length} picked · Clear
              </button>
            </Show>
          </div>
          <CategoryPicker categories={playable} difficulty={difficulty} selected={categories} onChange={setCategories} />
        </Card>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-canvas from-70% to-transparent pt-8">
          <div className="safe-bottom pointer-events-auto mx-auto flex w-full max-w-lg flex-col gap-2 px-4 pb-4">
            <Show when={matching === 0}>
              <InlineError message="No questions match those choices. Add a topic or change the difficulty." />
            </Show>
            <Show when={start.isError}>
              <InlineError message={start.error?.message ?? ''} />
            </Show>
            <div className="flex items-stretch gap-2.5">
              <p
                aria-label={`Points ${formatMultiplier(multiplierPct(config))}. Harder and faster pays more.`}
                className="flex shrink-0 flex-col items-center justify-center rounded-btn border-3 border-ink bg-sun px-3 font-display font-extrabold leading-none text-ink shadow-pop-sm"
              >
                <span className="flex items-center gap-1 text-[20px]">
                  <Zap size={16} strokeWidth={3} fill="currentColor" aria-hidden="true" />
                  {formatMultiplier(multiplierPct(config))}
                </span>
                <span className="mt-1 text-[11px] uppercase tracking-[0.08em]">points</span>
              </p>
              <Button type="submit" size={BUTTON_SIZE.LG} disabled={!ready} className="h-16 flex-1 text-[24px]" icon={<Play size={24} strokeWidth={3} fill="currentColor" aria-hidden="true" />}>
                <Show when={!start.isPending} fallback="Starting…">
                  Play
                </Show>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </PartyBackdrop>
  );
}
