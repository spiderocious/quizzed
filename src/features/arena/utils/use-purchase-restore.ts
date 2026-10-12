import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { platform, type PlatformPurchase } from '@shared/services/platform';

import { claimPurchase } from '../api/use-buy-gems';
import { WALLET_KEY } from '../api/use-wallet';

/**
 * Finishes purchases that were paid but never delivered: the phone reloaded on
 * the way back from the payment page, or the game closed mid-claim. Runs once
 * when the game opens, and again whenever the platform reports a purchase
 * nobody was waiting for.
 */
export function usePurchaseRestore(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: () => void = () => undefined;

    const settle = (purchase: PlatformPurchase): void => {
      void claimPurchase(purchase)
        .then(() => queryClient.invalidateQueries({ queryKey: WALLET_KEY }))
        .catch(() => undefined); // still undelivered: the next open tries again
    };

    void platform
      .purchases()
      .then((pending) => {
        if (cancelled) return;
        pending.forEach(settle);
        unsubscribe = platform.onPurchase(settle);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [queryClient]);
}
