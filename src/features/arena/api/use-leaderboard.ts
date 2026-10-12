import { useQuery } from '@tanstack/react-query';

import { platform, type Leaderboard, type PlatformError } from '@shared/services/platform';

export const LEADERBOARD_KEY = ['platform', 'leaderboard'] as const;

// The platform refreshes the board at most every 30 seconds.
const BOARD_STALE_MS = 30 * 1000;

export function useLeaderboard(enabled: boolean) {
  return useQuery<Leaderboard, PlatformError>({
    queryKey: LEADERBOARD_KEY,
    queryFn: () => platform.leaderboard(),
    enabled,
    staleTime: BOARD_STALE_MS,
    retry: false,
  });
}
