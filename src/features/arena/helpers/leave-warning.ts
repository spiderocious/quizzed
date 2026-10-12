import type { BoardRow } from '@shared/types/quiz';

import { ARENA_MODE, type ArenaMode } from '../arena.types';

export interface LeaveWarning {
  title: string;
  message: string;
}

interface LeaveInput {
  mode: ArenaMode;
  board: BoardRow[];
  myId: string;
  question: number;
  totalQuestions: number;
}

const points = (score: number): string => `${score.toLocaleString()} pts`;

/**
 * What walking out of a game in progress costs, in the player's own numbers.
 * Leaving does not end a duel: the others play on, so the leaver stops scoring
 * while their rival does not.
 */
export function leaveWarning({ mode, board, myId, question, totalQuestions }: LeaveInput): LeaveWarning {
  const mine = board.find((row) => row.player_id === myId)?.score ?? 0;

  if (mode === ARENA_MODE.SOLO) {
    return {
      title: 'Leave this run?',
      message: `You’re on ${points(mine)} after ${question} of ${totalQuestions} questions. Leave now and this run is lost: nothing goes on the leaderboard.`,
    };
  }

  // The board is in rank order, so the first row that is not me is my closest rival.
  const rival = board.find((row) => row.player_id !== myId);
  if (rival === undefined) {
    return { title: 'Leave the match?', message: `You’re on ${points(mine)}. Leave now and you forfeit this match.` };
  }
  if (rival.score >= mine) {
    return {
      title: 'Leave the match?',
      message: `You’re on ${points(mine)} and ${rival.name} has ${points(rival.score)}. Leave now and you lose this match to ${rival.name}.`,
    };
  }
  return {
    title: 'Leave the match?',
    message: `You’re ahead on ${points(mine)}, but ${rival.name} (${points(rival.score)}) keeps playing. Leave now and you stop scoring, so ${rival.name} can still take the match.`,
  };
}
