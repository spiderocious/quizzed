import { useMutation } from '@tanstack/react-query';

import { EP } from '@shared/constants/endpoints';
import { apiClient, type ApiError } from '@shared/services/api-client';
import { platform, type PlatformError } from '@shared/services/platform';

import type { Seat } from './use-start-solo';

/** Takes this player's seat in the room for a platform match. */
export function useJoinMatch() {
  return useMutation<Seat, ApiError | PlatformError, string>({
    mutationFn: async (matchId) => apiClient.post<Seat>(EP.PLATFORM.MATCH_JOIN(matchId), { session: await platform.session() }),
  });
}
