import { useQuery } from '@tanstack/react-query';

import { platform, type PlatformError, type PlatformIdentity } from '@shared/services/platform';

export const PLATFORM_IDENTITY_KEY = ['platform', 'identity'] as const;

/** Who is playing, according to Lagos Life (or the stand-in outside it). */
export function usePlatformIdentity(enabled = true) {
  return useQuery<PlatformIdentity, PlatformError>({
    queryKey: PLATFORM_IDENTITY_KEY,
    queryFn: () => platform.identify(),
    enabled,
    // The identity cannot change while the game is open.
    staleTime: Infinity,
    retry: false,
  });
}
