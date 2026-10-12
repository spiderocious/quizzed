import { Repeat, Show } from 'meemaw';

import { Check, Shuffle } from '@icons';
import { SOUND, sound } from '@shared/services/sound';
import type { QuizCategoryOption, QuizConfig } from '@shared/types/quiz';
import { cn } from '@shared/utils/cn';

import { countForCategory } from '../helpers/count-matching';

interface CategoryPickerProps {
  categories: QuizCategoryOption[];
  difficulty: QuizConfig['difficulty'];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const chipClass =
  'relative flex min-w-0 items-center gap-2 rounded-btn border-3 border-ink text-left transition-transform disabled:pointer-events-none disabled:opacity-35';

/**
 * Pick topics, or pick none and get everything shuffled together. "Surprise
 * me" is not a separate mode — it is simply the empty selection.
 *
 * Always two columns: this sits inside a phone-width column on every device,
 * so the layout follows the column, never the window.
 */
export function CategoryPicker({ categories, difficulty, selected, onChange }: CategoryPickerProps) {
  const everything = selected.length === 0;

  const toggle = (slug: string): void => {
    sound.play(SOUND.TAP);
    onChange(selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]);
  };

  return (
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        aria-pressed={everything}
        onClick={() => {
          sound.play(SOUND.TAP);
          onChange([]);
        }}
        className={cn(chipClass, 'col-span-2 gap-3 px-3 py-2.5', everything ? 'translate-y-1 bg-stage text-white' : 'bg-surface text-ink shadow-pop-sm')}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-sun text-ink">
          <Shuffle size={20} strokeWidth={3} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[18px] font-extrabold leading-tight">Surprise me</span>
          <span className={cn('block text-[13px] font-bold', everything ? 'text-white/80' : 'text-ink-3')}>Every topic, shuffled</span>
        </span>
        <Show when={everything}>
          <Check size={22} strokeWidth={4} aria-hidden="true" className="shrink-0" />
        </Show>
      </button>

      <Repeat each={categories}>
        {(category) => {
          const on = selected.includes(category.slug);
          const count = countForCategory(category, difficulty);
          return (
            <button
              key={category.slug}
              type="button"
              aria-pressed={on}
              disabled={count === 0}
              onClick={() => toggle(category.slug)}
              className={cn(chipClass, 'min-h-[56px] px-2 py-2', on ? 'translate-y-1 bg-action text-white' : 'bg-surface text-ink shadow-pop-sm')}
            >
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-canvas-tint text-[17px] leading-none"
                aria-hidden="true"
              >
                {category.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 font-display text-[15px] font-extrabold leading-[1.1]">{category.label}</span>
              </span>
              <Show when={on}>
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-sun text-ink">
                  <Check size={14} strokeWidth={4} aria-hidden="true" />
                </span>
              </Show>
            </button>
          );
        }}
      </Repeat>
    </div>
  );
}
