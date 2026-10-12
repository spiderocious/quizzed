import { describe, expect, it } from 'vitest';

import type { BoardRow } from '@shared/types/quiz';

import { ARENA_MODE } from '../../arena.types';
import { leaveWarning } from '../leave-warning';

const row = (player_id: string, name: string, score: number): BoardRow =>
  ({ player_id, name, score, avatar: '🦊', round_score: score, delta: 0, rank: 1, prev_rank: 1, streak: 0, result: 'none' }) as BoardRow;

describe('leaveWarning', () => {
  it('tells a solo player the run and its score are lost', () => {
    const warning = leaveWarning({ mode: ARENA_MODE.SOLO, board: [row('me', 'Ada', 1063)], myId: 'me', question: 4, totalQuestions: 10 });
    expect(warning.title).toBe('Leave this run?');
    expect(warning.message).toContain('1,063 pts after 4 of 10');
  });

  it('names the rival who wins when the leaver is behind', () => {
    const warning = leaveWarning({ mode: ARENA_MODE.DUEL, board: [row('bem', 'Bem', 2100), row('me', 'Ada', 900)], myId: 'me', question: 3, totalQuestions: 7 });
    expect(warning.message).toContain('you lose this match to Bem');
    expect(warning.message).toContain('2,100 pts');
    expect(warning.message).toContain('900 pts');
  });

  it('does not promise a loss to a leaver who is ahead', () => {
    const warning = leaveWarning({ mode: ARENA_MODE.DUEL, board: [row('me', 'Ada', 2100), row('bem', 'Bem', 900)], myId: 'me', question: 3, totalQuestions: 7 });
    expect(warning.message).toContain('You’re ahead on 2,100 pts');
    expect(warning.message).toContain('Bem can still take the match');
  });
});
