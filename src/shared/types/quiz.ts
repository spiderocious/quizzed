/**
 * The quiz as the server projects it. These mirror the backend's view structs
 * (games/quiz/quiz.types.go) field for field, in the wire's snake_case.
 */

export const QUIZ_PHASE = {
  INTRO: 'intro',
  QUESTION: 'question',
  REVEAL: 'reveal',
  LEADERBOARD: 'leaderboard',
  ROUND_END: 'round_end',
  FINISHED: 'finished',
} as const;
export type QuizPhase = (typeof QUIZ_PHASE)[keyof typeof QUIZ_PHASE];

export const PACING = { AUTO: 'auto', HOST: 'host' } as const;
export type Pacing = (typeof PACING)[keyof typeof PACING];

export const DIFFICULTY = { EASY: 'easy', MEDIUM: 'medium', HARD: 'hard', MIXED: 'mixed' } as const;
export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

export const ANSWER_RESULT = { CORRECT: 'correct', WRONG: 'wrong', NONE: 'none' } as const;
export type AnswerResult = (typeof ANSWER_RESULT)[keyof typeof ANSWER_RESULT];

export const AWARD = { SPEED_DEMON: 'speed_demon', SHARPSHOOTER: 'sharpshooter', ON_FIRE: 'on_fire' } as const;

/** Client → server action types the quiz understands. */
export const QUIZ_ACTION = {
  ANSWER: 'quiz.answer',
  NEXT: 'host.next',
  END_GAME: 'host.end_game',
} as const;

export interface QuizConfig {
  difficulty: Difficulty;
  categories: string[];
  rounds: number;
  questions_per_round: number;
  endless: boolean;
  seconds_per_question: number;
  pacing: Pacing;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  category: string;
  category_label: string;
  category_emoji: string;
  difficulty: string;
}

export interface QuizReveal {
  answer_idx: number;
  counts: number[];
  fastest: { player_id: string; name: string; avatar: string; ms: number } | null;
}

export interface BoardRow {
  player_id: string;
  name: string;
  avatar: string;
  score: number;
  round_score: number;
  delta: number;
  rank: number;
  prev_rank: number;
  streak: number;
  result: AnswerResult;
  connected: boolean;
}

export interface QuizYou {
  answered: boolean;
  choice: number | null;
  result: AnswerResult;
  points: number;
  speed_ms: number;
  score: number;
  rank: number;
  streak: number;
}

export interface QuizAward {
  key: string;
  title: string;
  blurb: string;
  player_id: string;
  name: string;
  avatar: string;
  value: string;
}

export interface QuizStatRow {
  player_id: string;
  name: string;
  avatar: string;
  rank: number;
  score: number;
  correct: number;
  answered: number;
  accuracy_pct: number;
  avg_ms: number;
  best_streak: number;
}

export interface QuizFinal {
  total_questions: number;
  rounds_played: number;
  awards: QuizAward[];
  stats: QuizStatRow[];
}

export interface QuizView {
  game: string;
  phase: QuizPhase;
  pacing: Pacing;
  round: number;
  /** 0 when the game is endless. */
  total_rounds: number;
  question_in_round: number;
  questions_per_round: number;
  question_seq: number;
  questions_asked: number;
  /** What each point is scaled by under these settings, in percent. */
  multiplier_pct: number;
  /** One phone, no big screen: shorter pauses and no separate scoreboard. */
  quick: boolean;
  phase_started_at: number;
  /** Absolute epoch ms. 0 means the phase waits for the host. */
  deadline: number;
  question: QuizQuestion | null;
  answered_ids: string[];
  active_count: number;
  reveal: QuizReveal | null;
  board: BoardRow[];
  you: QuizYou | null;
  final: QuizFinal | null;
}

export interface QuizCategoryOption {
  slug: string;
  label: string;
  emoji: string;
  blurb: string;
  colour: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface QuizOptions {
  game: string;
  total_questions: number;
  categories: QuizCategoryOption[];
  difficulties: Difficulty[];
  seconds_choices: number[];
  rounds: { min: number; max: number };
  questions_per_round: { min: number; max: number };
  pacings: Pacing[];
}
