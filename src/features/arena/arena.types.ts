/** The two one-phone ways to play. */
export const ARENA_MODE = { SOLO: 'solo', DUEL: 'duel' } as const;
export type ArenaMode = (typeof ARENA_MODE)[keyof typeof ARENA_MODE];
