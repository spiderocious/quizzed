import { useMutation } from '@tanstack/react-query';

import { EP } from '@shared/constants/endpoints';
import { apiClient, type ApiError } from '@shared/services/api-client';
import { platform, type PlatformError } from '@shared/services/platform';
import type { QuizConfig } from '@shared/types/quiz';

export interface Seat {
  code: string;
  player_id: string;
  player_token: string;
  name: string;
  avatar: string;
}

/**
 * Starts a solo run. The server is told who is playing by a platform session:
 * the player never types a name, and cannot claim to be someone else.
 */
export function useStartSolo() {
  return useMutation<Seat, ApiError | PlatformError, QuizConfig>({
    mutationFn: async (config) => apiClient.post<Seat>(EP.PLATFORM.SOLO, { session: await platform.session(), config }),
  });
}
