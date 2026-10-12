import { Show } from 'meemaw';

import { Sparkles } from '@icons';
import type { QuizView } from '@shared/types/quiz';
import { InlineError } from '@shared/ui/InlineError';
import { cn } from '@shared/utils/cn';

import { useBuyGems } from '../../api/use-buy-gems';
import { useReveal } from '../../api/use-reveal';
import { useWallet } from '../../api/use-wallet';

interface RevealAssistProps {
  code: string;
  game: QuizView;
}

const pillClass = 'flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-3 border-ink px-4 py-1.5 font-display text-[16px] font-extrabold leading-tight shadow-pop-sm';

/**
 * Pay gems to be shown the answer. Solo only, and never free of a cost in
 * points: a revealed question earns the base score and no speed bonus.
 *
 * The price belongs to the question — harder settings and later questions
 * cost more — and is quoted by the server, which is also the only thing that
 * can take the gems.
 */
export function RevealAssist({ code, game }: RevealAssistProps) {
  const wallet = useWallet();
  const reveal = useReveal();
  const buy = useBuyGems();

  const cost = game.reveal_cost;
  const hinted = game.you?.hint_idx !== null && game.you?.hint_idx !== undefined;
  const answered = game.you?.answered === true;
  if (cost <= 0 || wallet.data === undefined) return null;

  if (hinted) {
    return <p className={cn(pillClass, 'bg-sun text-ink')}>💡 Answer shown · base points only</p>;
  }
  if (answered) return null;

  const gems = wallet.data.gems;
  const pack = wallet.data.products[0];
  const canAfford = gems >= cost;
  const busy = reveal.isPending || buy.isPending;
  const error = reveal.error?.message ?? buy.error?.message;

  return (
    <div className="flex flex-col gap-1.5">
      <Show
        when={canAfford}
        fallback={
          <Show when={pack !== undefined}>
            <button type="button" disabled={busy} onClick={() => pack !== undefined && buy.mutate(pack.id)} className={cn(pillClass, 'bg-surface text-ink transition-transform active:translate-y-1 active:shadow-none disabled:opacity-50')}>
              <Sparkles size={18} strokeWidth={3} aria-hidden="true" />
              <Show when={!buy.isPending} fallback="Opening…">
                Reveal costs {cost} 💎 · Get {pack?.gems} gems
              </Show>
            </button>
          </Show>
        }
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => reveal.mutate({ code, questionSeq: game.question_seq })}
          className={cn(pillClass, 'bg-sun text-ink transition-transform active:translate-y-1 active:shadow-none disabled:opacity-50')}
        >
          <Show when={!reveal.isPending} fallback="Revealing…">
            💡 Reveal answer · {cost} 💎
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[13px]">you have {gems}</span>
          </Show>
        </button>
      </Show>
      <Show when={error !== undefined}>
        <InlineError message={error ?? ''} />
      </Show>
    </div>
  );
}
