/**
 * Who this browser is in a room. Kept in localStorage so a refresh, or a phone
 * that locks and wakes, takes the same seat back with its score intact.
 *
 * Storage can throw (private mode, blocked site data), so every access is
 * guarded and the app works without it — you just rejoin after a refresh.
 */
export interface PlayerSeat {
  playerId: string;
  token: string;
  name: string;
  avatar: string;
}

const HOST_PREFIX = 'ft:host:';
const SEAT_PREFIX = 'ft:seat:';
const NAME_KEY = 'ft:last-name';
const AVATAR_KEY = 'ft:last-avatar';

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Nothing to do: the session simply will not survive a refresh.
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // As above.
  }
}

export const sessionStore = {
  getHostToken: (code: string): string | null => read(HOST_PREFIX + code),
  setHostToken: (code: string, token: string): void => write(HOST_PREFIX + code, token),
  clearHost: (code: string): void => remove(HOST_PREFIX + code),

  getSeat: (code: string): PlayerSeat | null => {
    const raw = read(SEAT_PREFIX + code);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as Partial<PlayerSeat>;
      if (typeof parsed.playerId === 'string' && typeof parsed.token === 'string') {
        return { playerId: parsed.playerId, token: parsed.token, name: parsed.name ?? '', avatar: parsed.avatar ?? '' };
      }
      return null;
    } catch {
      return null;
    }
  },
  setSeat: (code: string, seat: PlayerSeat): void => {
    write(SEAT_PREFIX + code, JSON.stringify(seat));
    write(NAME_KEY, seat.name);
    write(AVATAR_KEY, seat.avatar);
  },
  clearSeat: (code: string): void => remove(SEAT_PREFIX + code),

  /** Remembered between games so a returning player does not retype it. */
  lastName: (): string => read(NAME_KEY) ?? '',
  lastAvatar: (): string => read(AVATAR_KEY) ?? '',
};
