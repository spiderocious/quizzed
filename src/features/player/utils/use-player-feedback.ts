import { useEffect } from 'react';

import { confettiBurst } from '@shared/services/confetti';
import { buzz, SOUND, sound } from '@shared/services/sound';
import { ANSWER_RESULT, QUIZ_PHASE, type QuizView } from '@shared/types/quiz';

const BUZZ_NEW_QUESTION = 40;
const BUZZ_CORRECT = [40, 50, 90];
const BUZZ_WRONG = 220;

/**
 * What a phone does when something happens: a buzz when a question arrives (so
 * you look down), and a sound, a buzz and confetti — or a sad trombone — when
 * the answer is revealed.
 */
export function usePlayerFeedback(game: QuizView | null): void {
  const phase = game?.phase;
  const seq = game?.question_seq ?? 0;
  const result = game?.you?.result;

  useEffect(() => {
    if (phase === QUIZ_PHASE.QUESTION) {
      sound.play(SOUND.GO);
      buzz(BUZZ_NEW_QUESTION);
      return;
    }
    if (phase !== QUIZ_PHASE.REVEAL) return;

    if (result === ANSWER_RESULT.CORRECT) {
      sound.play(SOUND.CORRECT);
      buzz(BUZZ_CORRECT);
      confettiBurst();
    } else {
      sound.play(SOUND.WRONG);
      buzz(BUZZ_WRONG);
    }
    // Once per phase step. `result` is read at that moment, not subscribed to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seq]);

  useEffect(() => {
    if (phase === QUIZ_PHASE.FINISHED) sound.play(SOUND.FANFARE);
  }, [phase]);
}
