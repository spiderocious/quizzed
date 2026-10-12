/**
 * Every sound in the game, synthesised with the Web Audio API.
 *
 * Nothing is downloaded: there are no audio files to host, cache or fail to
 * load on a slow connection, and a sound is ready the instant it is needed.
 * Browsers only allow audio after a tap, so `unlock()` is called from the
 * first pointer event (see app.tsx).
 */
export const SOUND = {
  TAP: 'tap',
  JOIN: 'join',
  TICK: 'tick',
  LOCK: 'lock',
  GO: 'go',
  WHOOSH: 'whoosh',
  REVEAL: 'reveal',
  CORRECT: 'correct',
  WRONG: 'wrong',
  RANK: 'rank',
  DRUMROLL: 'drumroll',
  FANFARE: 'fanfare',
  REACT: 'react',
} as const;
export type SoundKey = (typeof SOUND)[keyof typeof SOUND];

const MUTE_KEY = 'ft:muted';
const MASTER_VOLUME = 0.5;

type Listener = (muted: boolean) => void;
type Wave = OscillatorType;

// Note frequencies, so the tunes below read as tunes.
const C4 = 261.63;
const E4 = 329.63;
const G4 = 392.0;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

class SoundService {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted = false;
  private listeners = new Set<Listener>();

  constructor() {
    try {
      this.muted = window.localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      this.muted = false;
    }
  }

  /** Must be called from a user gesture at least once. Safe to call repeatedly. */
  unlock(): void {
    if (this.ctx === null) {
      const Ctor = window.AudioContext;
      if (Ctor === undefined) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = MASTER_VOLUME;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      window.localStorage.setItem(MUTE_KEY, String(muted));
    } catch {
      // The preference just will not survive a refresh.
    }
    this.listeners.forEach((listener) => listener(muted));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Held silent while the game is in the background or behind a platform sheet. */
  private paused = false;

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (this.ctx === null) return;
    if (paused) void this.ctx.suspend();
    else void this.ctx.resume();
  }

  play(key: SoundKey): void {
    if (this.paused || this.muted || this.ctx === null || this.master === null || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;

    switch (key) {
      case SOUND.TAP:
        this.tone(660, t, 0.06, 'triangle', 0.25);
        break;
      case SOUND.JOIN:
        this.tone(C5, t, 0.09, 'triangle', 0.3);
        this.tone(G5, t + 0.08, 0.14, 'triangle', 0.3);
        break;
      case SOUND.REACT:
        this.sweep(500, 1100, t, 0.12, 'sine', 0.2);
        break;
      case SOUND.TICK:
        this.tone(880, t, 0.045, 'square', 0.12);
        break;
      case SOUND.LOCK:
        this.tone(E5, t, 0.07, 'square', 0.14);
        this.tone(C6, t + 0.07, 0.1, 'square', 0.14);
        break;
      case SOUND.GO:
        this.tone(C5, t, 0.1, 'sawtooth', 0.16);
        this.tone(E5, t + 0.1, 0.1, 'sawtooth', 0.16);
        this.tone(G5, t + 0.2, 0.26, 'sawtooth', 0.18);
        break;
      case SOUND.WHOOSH:
        this.noise(t, 0.36, 400, 3200, 0.22);
        break;
      case SOUND.REVEAL:
        this.noise(t, 0.12, 1800, 300, 0.3);
        this.tone(G4, t + 0.02, 0.2, 'triangle', 0.3);
        this.tone(C5, t + 0.14, 0.34, 'triangle', 0.3);
        break;
      case SOUND.CORRECT:
        [C5, E5, G5, C6].forEach((freq, i) => this.tone(freq, t + i * 0.085, 0.2, 'triangle', 0.28));
        break;
      case SOUND.WRONG:
        this.sweep(300, 120, t, 0.34, 'sawtooth', 0.2);
        this.sweep(220, 90, t + 0.12, 0.36, 'square', 0.1);
        break;
      case SOUND.RANK:
        this.sweep(C5, C6, t, 0.2, 'triangle', 0.24);
        break;
      case SOUND.DRUMROLL:
        for (let i = 0; i < 22; i += 1) this.noise(t + i * 0.055, 0.045, 900, 600, 0.1 + i * 0.008);
        break;
      case SOUND.FANFARE:
        [
          [C5, 0], [C5, 0.14], [C5, 0.28], [E5, 0.42], [G5, 0.62], [E5, 0.82], [G5, 0.96], [C6, 1.14],
        ].forEach(([freq, at]) => {
          this.tone(freq ?? C5, t + (at ?? 0), 0.22, 'sawtooth', 0.16);
          this.tone((freq ?? C5) / 2, t + (at ?? 0), 0.22, 'triangle', 0.16);
        });
        this.tone(C4, t + 1.14, 0.9, 'triangle', 0.2);
        this.tone(E4, t + 1.14, 0.9, 'triangle', 0.16);
        this.tone(D5, t + 1.3, 0.08, 'triangle', 0.1);
        this.tone(C6, t + 1.38, 0.7, 'sawtooth', 0.14);
        break;
    }
  }

  private envelope(start: number, duration: number, peak: number): GainNode | null {
    if (this.ctx === null || this.master === null) return null;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(this.master);
    return gain;
  }

  private tone(freq: number, start: number, duration: number, wave: Wave, peak: number): void {
    this.sweep(freq, freq, start, duration, wave, peak);
  }

  private sweep(from: number, to: number, start: number, duration: number, wave: Wave, peak: number): void {
    const gain = this.envelope(start, duration, peak);
    if (this.ctx === null || gain === null) return;
    const osc = this.ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(from, start);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  /** A burst of filtered noise: whooshes, drum hits. */
  private noise(start: number, duration: number, fromHz: number, toHz: number, peak: number): void {
    const gain = this.envelope(start, duration, peak);
    if (this.ctx === null || gain === null) return;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(fromHz, start);
    filter.frequency.exponentialRampToValueAtTime(toHz, start + duration);
    source.connect(filter);
    filter.connect(gain);
    source.start(start);
  }
}

export const sound = new SoundService();

/** A short buzz on phones that support it. Silent everywhere else. */
export function buzz(pattern: number | number[]): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}
