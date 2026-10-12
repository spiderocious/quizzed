import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { ENV } from '@shared/config/env';
import { EP } from '@shared/constants/endpoints';
import { ApiError, apiClient } from '@shared/services/api-client';

import { SERVER_MESSAGE, type Reaction, type Role, type RoomState, type ServerEnvelope, type SocketError } from './protocol';
import { CONNECTION, RoomSocketContext, type Connection, type RoomSocketValue } from './room-socket-context';

interface RoomSocketProviderProps {
  code: string;
  role: Role;
  token: string;
  children: ReactNode;
}

const RETRY_MIN_MS = 500;
const RETRY_MAX_MS = 5000;
// After this many attempts that never opened, stop assuming it is the network.
const REFUSALS_BEFORE_CHECK = 3;
const HTTP_NOT_FOUND = 404;
const HTTP_GONE = 410;

/**
 * Owns the one websocket for a room view (big screen or phone).
 *
 * The server sends the whole state on every change, so there is nothing to
 * replay after a drop: reconnect, and the first message is enough. Reconnects
 * back off and never give up while the room exists — a phone that locks during
 * a round should be back in the game the moment it wakes.
 */
export function RoomSocketProvider({ code, role, token, children }: RoomSocketProviderProps) {
  const [status, setStatus] = useState<Connection>(CONNECTION.CONNECTING);
  const [state, setState] = useState<RoomState | null>(null);
  const [error, setError] = useState<(SocketError & { seq: number }) | null>(null);
  const [clockOffset, setClockOffset] = useState(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reactionListeners = useRef(new Set<(reaction: Reaction) => void>());

  useEffect(() => {
    let disposed = false;
    let finished = false; // closed / gone / rejected — no more retries
    let retryTimer = 0;
    let attempt = 0;
    let refusals = 0;
    let errorSeq = 0;

    const finish = (next: Connection): void => {
      finished = true;
      setStatus(next);
    };

    // The browser hides why a websocket was refused, so ask over HTTP.
    const diagnose = async (): Promise<void> => {
      try {
        await apiClient.get(EP.ROOMS.DETAIL(code));
        if (!disposed) finish(CONNECTION.REJECTED);
      } catch (cause) {
        if (disposed) return;
        const missing = cause instanceof ApiError && (cause.status === HTTP_NOT_FOUND || cause.status === HTTP_GONE);
        if (missing) finish(CONNECTION.GONE);
        else schedule();
      }
    };

    const schedule = (): void => {
      if (disposed || finished) return;
      const delay = Math.min(RETRY_MAX_MS, RETRY_MIN_MS * 2 ** Math.min(attempt, 4));
      attempt += 1;
      retryTimer = window.setTimeout(connect, delay);
    };

    function connect(): void {
      if (disposed || finished) return;
      const query = new URLSearchParams({ code, role, token }).toString();
      const socket = new WebSocket(`${ENV.WS_BASE_URL}${EP.SOCKET}?${query}`);
      socketRef.current = socket;
      let opened = false;

      socket.onopen = () => {
        opened = true;
        attempt = 0;
        refusals = 0;
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        let envelope: ServerEnvelope;
        try {
          envelope = JSON.parse(event.data) as ServerEnvelope;
        } catch {
          return;
        }

        if (envelope.type === SERVER_MESSAGE.STATE && envelope.state !== undefined) {
          setClockOffset(envelope.state.now - Date.now());
          setState(envelope.state);
          setStatus(CONNECTION.LIVE);
          return;
        }
        if (envelope.type === SERVER_MESSAGE.ERROR && envelope.error !== undefined) {
          errorSeq += 1;
          setError({ ...envelope.error, seq: errorSeq });
          return;
        }
        if (envelope.type === SERVER_MESSAGE.REACTION && envelope.reaction !== undefined) {
          const reaction = envelope.reaction;
          reactionListeners.current.forEach((listener) => listener(reaction));
          return;
        }
        if (envelope.type === SERVER_MESSAGE.CLOSED) {
          finish(CONNECTION.CLOSED);
        }
      };

      socket.onclose = () => {
        if (disposed || finished) return;
        setStatus(CONNECTION.RECONNECTING);
        if (!opened) {
          refusals += 1;
          if (refusals >= REFUSALS_BEFORE_CHECK) {
            refusals = 0;
            void diagnose();
            return;
          }
        }
        schedule();
      };
    }

    setStatus(CONNECTION.CONNECTING);
    setState(null);
    connect();

    // A phone waking from sleep often has a dead socket it has not noticed yet.
    const onVisible = (): void => {
      if (document.visibilityState !== 'visible' || disposed || finished) return;
      const socket = socketRef.current;
      if (socket === null || socket.readyState === WebSocket.CLOSED) {
        window.clearTimeout(retryTimer);
        attempt = 0;
        connect();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      disposed = true;
      window.clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisible);
      const socket = socketRef.current;
      socketRef.current = null;
      if (socket !== null) {
        socket.onclose = null;
        socket.onmessage = null;
        socket.close();
      }
    };
  }, [code, role, token]);

  const send = useCallback((type: string, payload?: unknown) => {
    const socket = socketRef.current;
    if (socket === null || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload === undefined ? { type } : { type, payload }));
  }, []);

  const onReaction = useCallback((listener: (reaction: Reaction) => void) => {
    reactionListeners.current.add(listener);
    return () => {
      reactionListeners.current.delete(listener);
    };
  }, []);

  const value = useMemo<RoomSocketValue>(
    () => ({ status, state, error, clockOffset, send, onReaction }),
    [status, state, error, clockOffset, send, onReaction],
  );

  return <RoomSocketContext.Provider value={value}>{children}</RoomSocketContext.Provider>;
}
