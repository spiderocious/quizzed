const TEEN_START = 11;
const TEEN_END = 13;
const SUFFIXES: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };

/** 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd". */
export function ordinal(n: number): string {
  const lastTwo = n % 100;
  if (lastTwo >= TEEN_START && lastTwo <= TEEN_END) return `${n}th`;
  return `${n}${SUFFIXES[n % 10] ?? 'th'}`;
}
