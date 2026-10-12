import { useQuery } from '@tanstack/react-query';

import { EP } from '@shared/constants/endpoints';
import { apiClient, type ApiError } from '@shared/services/api-client';
import { platform, type PlatformError } from '@shared/services/platform';

export interface GemPack {
  id: string;
  gems: number;
}

export interface Wallet {
  gems: number;
  products: GemPack[];
}

export const WALLET_KEY = ['platform', 'wallet'] as const;

/** The player's gems and the packs on sale. Gems are spent on answer reveals in a solo run. */
export function useWallet() {
  return useQuery<Wallet, ApiError | PlatformError>({
    queryKey: WALLET_KEY,
    queryFn: async () => apiClient.post<Wallet>(EP.PLATFORM.WALLET, { session: await platform.session() }),
  });
}
