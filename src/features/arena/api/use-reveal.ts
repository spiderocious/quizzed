import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EP } from '@shared/constants/endpoints';
import { apiClient, type ApiError } from '@shared/services/api-client';
import { platform, type PlatformError } from '@shared/services/platform';

import { WALLET_KEY, type Wallet } from './use-wallet';

interface Revealed {
  answer_idx: number;
  cost: number;
  gems: number;
}

interface RevealInput {
  code: string;
  questionSeq: number;
}

/**
 * Spends gems to see the answer to the question in play. The answer itself
 * arrives in the game state, so it survives a refresh; this only pays for it.
 */
export function useReveal() {
  const queryClient = useQueryClient();
  return useMutation<Revealed, ApiError | PlatformError, RevealInput>({
    mutationFn: async ({ code, questionSeq }) =>
      apiClient.post<Revealed>(EP.PLATFORM.REVEAL(code), { session: await platform.session(), question_seq: questionSeq }),
    onSuccess: (revealed) => {
      queryClient.setQueryData<Wallet>(WALLET_KEY, (wallet) => (wallet === undefined ? wallet : { ...wallet, gems: revealed.gems }));
    },
  });
}
