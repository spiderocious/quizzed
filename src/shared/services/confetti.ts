import confetti from 'canvas-confetti';

const PARTY_COLOURS = ['#2d5bff', '#27b973', '#ff8a2a', '#f7c948', '#ff6fb5', '#e85a4f', '#5bc0eb'];

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** One pop from the middle: a right answer, a new leader. */
export function confettiBurst(): void {
  if (reducedMotion()) return;
  void confetti({ particleCount: 90, spread: 80, startVelocity: 42, origin: { y: 0.6 }, colors: PARTY_COLOURS });
}

/** Cannons from both sides for a few seconds: the final podium. */
export function confettiCelebration(durationMs = 4500): () => void {
  if (reducedMotion()) return () => undefined;
  const end = Date.now() + durationMs;
  let frame = 0;

  const fire = (): void => {
    void confetti({ particleCount: 5, angle: 60, spread: 62, origin: { x: 0, y: 0.7 }, colors: PARTY_COLOURS });
    void confetti({ particleCount: 5, angle: 120, spread: 62, origin: { x: 1, y: 0.7 }, colors: PARTY_COLOURS });
    if (Date.now() < end) frame = window.requestAnimationFrame(fire);
  };
  fire();

  return () => {
    window.cancelAnimationFrame(frame);
    confetti.reset();
  };
}
