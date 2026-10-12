import { createContext, useContext } from 'react';

import type { Reaction, RoomState, SocketError } from './protocol';

export const CONNECTION = {
  CONNECTING: 'connecting',
  LIVE: 'live',
  RECONNECTING: 'reconnecting',
  /** The host closed the room. */
  CLOSED: 'closed',
  /** The room no longer exists. */
  GONE: 'gone',
  /** The room exists but this seat was not accepted. */
  REJECTED: 'rejected',
} as const;
export type Connection = (typeof CONNECTION)[keyof typeof CONNECTION];

export interface RoomSocketValue {
  readonly status: Connection;
  /** The whole truth, replaced on every server message. Null until the first. */
  readonly state: RoomState | null;
  /** The most recent server.error, with a counter so a repeat still registers. */
  readonly error: (SocketError & { seq: number }) | null;
  /** server time − local time, in ms. Add it to Date.now() to get server time. */
  readonly clockOffset: number;
  readonly send: (type: string, payload?: unknown) => void;
  /** Subscribe to reactions from phones. Returns the unsubscribe function. */
  readonly onReaction: (listener: (reaction: Reaction) => void) => () => void;
}

export const RoomSocketContext = createContext<RoomSocketValue | null>(null);

export function useRoomSocket(): RoomSocketValue {
  const ctx = useContext(RoomSocketContext);
  if (ctx === null) {
    throw new Error('useRoomSocket must be used inside a RoomSocketProvider');
  }
  return ctx;
}
