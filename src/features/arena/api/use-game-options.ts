import { useQuery } from '@tanstack/react-query';

import { EP } from '@shared/constants/endpoints';
import { apiClient, type ApiError } from '@shared/services/api-client';
import type { QuizConfig, QuizOptions } from '@shared/types/quiz';

export interface GameOptions {
  game: {
    id: string;
    title: string;
    tagline: string;
    emoji: string;
    default_config: QuizConfig;
  };
  options: QuizOptions;
}

export const gameOptionsKey = (gameId: string) => ['games', gameId, 'options'] as const;

export function useGameOptions(gameId: string) {
  return useQuery<GameOptions, ApiError>({
    queryKey: gameOptionsKey(gameId),
    queryFn: ({ signal }) => apiClient.get<GameOptions>(EP.GAMES.OPTIONS(gameId), signal),
    enabled: gameId !== '',
  });
}
