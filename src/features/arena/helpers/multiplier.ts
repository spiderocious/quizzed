import { DIFFICULTY, type QuizConfig } from '@shared/types/quiz';

// Mirrors the server (games/quiz/quiz.config.go). The server's figure is the
// one that counts; this only previews it on the setup screen before a game
// exists, and the game itself reports the real one.
const DIFFICULTY_PCT: Record<string, number> = {
  [DIFFICULTY.EASY]: 80,
  [DIFFICULTY.MIXED]: 100,
  [DIFFICULTY.MEDIUM]: 110,
  [DIFFICULTY.HARD]: 130,
};

function timerPct(seconds: number): number {
  if (seconds <= 10) return 120;
  if (seconds <= 15) return 110;
  if (seconds <= 20) return 100;
  return 90;
}

/** What every point is scaled by under these settings, in percent. */
export function multiplierPct(config: Pick<QuizConfig, 'difficulty' | 'seconds_per_question'>): number {
  return Math.floor(((DIFFICULTY_PCT[config.difficulty] ?? 100) * timerPct(config.seconds_per_question)) / 100);
}

/** 156 → "×1.56". */
export function formatMultiplier(pct: number): string {
  return `×${(pct / 100).toFixed(2).replace(/0$/, '')}`;
}
