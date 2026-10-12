import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';


import { platform } from '@shared/services/platform';
import { QUIZ_PHASE, type QuizView } from '@shared/types/quiz';

import { LEADERBOARD_KEY } from '../api/use-leaderboard';

export const SUBMISSION = { IDLE: 'idle', SENDING: 'sending', SAVED: 'saved', FAILED: 'failed' } as const;
export type Submission = (typeof SUBMISSION)[keyof typeof SUBMISSION];

/**
 * Sends a finished solo score to the platform's leaderboard, once per run.
 *
 * "Once" is keyed on the moment the run finished, so playing again in the same
 * room submits the new run and a re-render never submits twice. The platform
 * keeps only a player's best, and takes one score every 20 seconds — a failed
 * send is reported, not retried in a loop.
 */
export function useScoreSubmission(game: QuizView | null, enabled: boolean): Submission {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Submission>(SUBMISSION.IDLE);
  const submittedFor = useRef(0);

  const finishedAt = game?.phase === QUIZ_PHASE.FINISHED ? game.phase_started_at : 0;
  const score = game?.you?.score ?? 0;

  useEffect(() => {
    if (!enabled || finishedAt === 0 || submittedFor.current === finishedAt) return;
    submittedFor.current = finishedAt;
    setStatus(SUBMISSION.SENDING);
    platform
      .submitScore(score)
      .then(() => {
        setStatus(SUBMISSION.SAVED);
        return queryClient.invalidateQueries({ queryKey: LEADERBOARD_KEY });
      })
      .catch(() => setStatus(SUBMISSION.FAILED));
  }, [enabled, finishedAt, score, queryClient]);

  return finishedAt === 0 ? SUBMISSION.IDLE : status;
}
