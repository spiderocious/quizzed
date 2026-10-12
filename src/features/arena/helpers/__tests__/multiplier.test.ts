import { describe, expect, it } from 'vitest';

import { DIFFICULTY } from '@shared/types/quiz';

import { formatMultiplier, multiplierPct } from '../multiplier';

describe('multiplierPct', () => {
  // The same table the server is tested against (internal/app/app_test.go).
  it.each([
    [DIFFICULTY.MIXED, 20, 100],
    [DIFFICULTY.EASY, 30, 72],
    [DIFFICULTY.EASY, 20, 80],
    [DIFFICULTY.MEDIUM, 15, 121],
    [DIFFICULTY.HARD, 20, 130],
    [DIFFICULTY.HARD, 10, 156],
  ])('%s at %is is %i%%', (difficulty, seconds, expected) => {
    expect(multiplierPct({ difficulty, seconds_per_question: seconds })).toBe(expected);
  });
});

describe('formatMultiplier', () => {
  it.each([
    [100, '×1.0'],
    [156, '×1.56'],
    [80, '×0.8'],
    [121, '×1.21'],
  ])('%i → %s', (pct, expected) => {
    expect(formatMultiplier(pct)).toBe(expected);
  });
});
