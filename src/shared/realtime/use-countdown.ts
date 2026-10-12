import { useEffect, useState } from 'react';

import { useRoomSocket } from './room-socket-context';

const TICK_MS = 100;
const MS_PER_SECOND = 1000;

export interface Countdown {
  msLeft: number;
  /** Whole seconds left, rounded up: shows "1" until the very end. */
  secondsLeft: number;
  /** 1 at the start, 0 at the deadline. */
  fraction: number;
  /** False when the phase has no deadline (it waits for the host). */
  running: boolean;
}

/**
 * Counts down to an ABSOLUTE server deadline.
 *
 * Never an independent client timer: every device computes the time left from
 * the same deadline and its own measured offset from the server clock, so the
 * TV and every phone hit zero together.
 */
export function useCountdown(deadline: number, startedAt: number): Countdown {
  const { clockOffset } = useRoomSocket();
  const [now, setNow] = useState(() => Date.now() + clockOffset);

  useEffect(() => {
    if (deadline <= 0) return undefined;
    setNow(Date.now() + clockOffset);
    const timer = window.setInterval(() => setNow(Date.now() + clockOffset), TICK_MS);
    return () => window.clearInterval(timer);
  }, [deadline, clockOffset]);

  if (deadline <= 0) {
    return { msLeft: 0, secondsLeft: 0, fraction: 0, running: false };
  }

  const total = Math.max(1, deadline - startedAt);
  const msLeft = Math.max(0, deadline - now);
  return {
    msLeft,
    secondsLeft: Math.ceil(msLeft / MS_PER_SECOND),
    fraction: Math.min(1, msLeft / total),
    running: true,
  };
}
