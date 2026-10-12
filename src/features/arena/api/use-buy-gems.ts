import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EP } from '@shared/constants/endpoints';
import { apiClient, type ApiError } from '@shared/services/api-client';
import { platform, type PlatformError, type PlatformPurchase } from '@shared/services/platform';

import { WALLET_KEY, type Wallet } from './use-wallet';

interface Claimed {
  gems: number;
  credited: boolean;
  added: number;
}

/**
 * Hands a paid purchase to our server, which checks it with the platform
 * before any gems are given. Safe to call twice for one purchase.
 */
export async function claimPurchase(purchase: PlatformPurchase): Promise<Claimed> {
  return apiClient.post<Claimed>(EP.PLATFORM.PURCHASE_CLAIM(purchase.purchaseId), { session: await platform.session() });
}

/** Buys a gem pack: the platform's pay sheet first, then our server's check. */
export function useBuyGems() {
  const queryClient = useQueryClient();
  return useMutation<Claimed, ApiError | PlatformError, string>({
    mutationFn: async (productId) => claimPurchase(await platform.purchase(productId)),
    onSuccess: (claimed) => {
      queryClient.setQueryData<Wallet>(WALLET_KEY, (wallet) => (wallet === undefined ? wallet : { ...wallet, gems: claimed.gems }));
    },
  });
}
