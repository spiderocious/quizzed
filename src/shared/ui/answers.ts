import { Circle, Diamond, Square, Triangle, type LucideIcon } from '@icons';

/**
 * The four answers. Fixed order, and each colour is locked to a shape and a
 * letter — so the big screen and the phone agree, and colour is never the only
 * way to tell two answers apart.
 */
export interface AnswerStyle {
  letter: string;
  shape: LucideIcon;
  bg: string;
  text: string;
  /** For bars and chips that need the colour without the fill class. */
  cssVar: string;
}

export const ANSWERS: readonly AnswerStyle[] = [
  { letter: 'A', shape: Triangle, bg: 'bg-answer-a', text: 'text-white', cssVar: 'var(--answer-a)' },
  { letter: 'B', shape: Diamond, bg: 'bg-answer-b', text: 'text-ink', cssVar: 'var(--answer-b)' },
  { letter: 'C', shape: Circle, bg: 'bg-answer-c', text: 'text-ink', cssVar: 'var(--answer-c)' },
  { letter: 'D', shape: Square, bg: 'bg-answer-d', text: 'text-white', cssVar: 'var(--answer-d)' },
];

const FALLBACK: AnswerStyle = { letter: '?', shape: Circle, bg: 'bg-surface', text: 'text-ink', cssVar: 'var(--surface)' };

export function answerStyle(index: number): AnswerStyle {
  return ANSWERS[index] ?? FALLBACK;
}
