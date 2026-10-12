/** Game ids, as registered by the backend. */
export const GAME_ID = {
  QUIZ: 'quiz',
} as const;

export type GameId = (typeof GAME_ID)[keyof typeof GAME_ID];
