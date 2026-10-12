import { DIFFICULTY, type QuizCategoryOption, type QuizConfig } from '@shared/types/quiz';

/** How many questions one category holds at the chosen difficulty. */
export function countForCategory(category: QuizCategoryOption, difficulty: QuizConfig['difficulty']): number {
  switch (difficulty) {
    case DIFFICULTY.EASY:
      return category.easy;
    case DIFFICULTY.MEDIUM:
      return category.medium;
    case DIFFICULTY.HARD:
      return category.hard;
    default:
      return category.total;
  }
}

/** How many questions match the whole configuration. An empty pick means every category. */
export function countMatching(categories: QuizCategoryOption[], config: QuizConfig): number {
  return categories
    .filter((category) => config.categories.length === 0 || config.categories.includes(category.slug))
    .reduce((sum, category) => sum + countForCategory(category, config.difficulty), 0);
}
