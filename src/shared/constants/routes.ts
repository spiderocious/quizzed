/**
 * Single source of truth for every path in the app.
 * Never inline a path string in a <Link to="..."> or navigate("...").
 *
 * One phone per player: a solo run, or a duel matched by Lagos Life.
 */
export const ROUTES = {
  HOME: '/',
  SOLO: '/solo',
  SOLO_PLAY: '/solo/:code',
  DUEL: '/duel',
  DUEL_PLAY: '/duel/:code',
} as const;

/** Parametric routes are functions, so a path is never assembled by hand. */
export const PATHS = {
  home: '/',
  solo: '/solo',
  soloPlay: (code: string) => `/solo/${code}`,
  duel: '/duel',
  duelPlay: (code: string) => `/duel/${code}`,
} as const;
