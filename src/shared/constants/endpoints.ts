/**
 * Single source of truth for backend paths. Never inline one in a hook.
 *
 * Mirrors the routes registered by the backend features. When a path changes
 * there it changes here in the same commit — a stale EP constant is the most
 * common cause of a mystery 404.
 */
const V1 = '/api/v1';

export const EP = {
  // Infrastructure probes are unversioned: they are not API surface.
  HEALTH: '/health',

  GAMES: {
    LIST: `${V1}/games`,
    OPTIONS: (gameId: string) => `${V1}/games/${gameId}/options`,
  },

  ROOMS: {
    CREATE: `${V1}/rooms`,
    DETAIL: (code: string) => `${V1}/rooms/${code}`,
    JOIN: (code: string) => `${V1}/rooms/${code}/players`,
  },

  SOLO: {
    START: `${V1}/solo`,
  },

  /** Lagos Life: players identified by a platform session. */
  PLATFORM: {
    STATUS: `${V1}/platform/status`,
    SOLO: `${V1}/platform/solo`,
    MATCH_JOIN: (matchId: string) => `${V1}/platform/matches/${encodeURIComponent(matchId)}/join`,
  },

  RESULTS: {
    LIST: `${V1}/results`,
  },

  // The realtime gateway. A websocket, not a REST resource.
  SOCKET: '/ws',
} as const;
