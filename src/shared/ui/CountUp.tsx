import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  value: number;
  durationMs?: number;
  className?: string;
}

const DEFAULT_DURATION_MS = 900;

/** A number that rolls to its new value instead of jumping. */
export function CountUp({ value, durationMs = DEFAULT_DURATION_MS, className }: CountUpProps) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return undefined;

    const start = performance.now();
    let frame = 0;
    const step = (now: number): void => {
      const progress = Math.min(1, (now - start) / durationMs);
      // Ease-out: fast at first, settling at the end.
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (value - from) * eased);
      fromRef.current = next;
      setShown(next);
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <span className={className}>{shown.toLocaleString()}</span>;
}
