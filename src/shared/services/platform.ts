import { ENV } from '@shared/config/env';

/**
 * The host platform: Lagos Life, through the Vatar Games SDK.
 * Reference: https://lagoslife.app/developers/docs
 *
 * Everything the game needs from the platform goes through this one module, so
 * no screen ever touches `window.Vatar` directly. That matters for one reason
 * above all: the SDK only works inside the platform's frame. Open the game
 * anywhere else — localhost, a preview link — and `init()` rejects. Outside
 * production this module then falls back to a stand-in identity, so the whole
 * game can be built and tested without the platform. The server accepts that
 * stand-in only when it, too, is outside production.
 */

// Always loaded from the platform, never a copy: it receives security fixes.
const SDK_URL = 'https://lagoslife.app/sdk/vatar-games-v1.js';
const SDK_TIMEOUT_MS = 6000;
const DEV_ID_KEY = 'ft:dev-player';
const DEV_SESSION_PREFIX = 'dev:';
const DEV_PURCHASE_PREFIX = 'dev_';

export const PLATFORM_KIND = { LIVE: 'live', DEV: 'dev' } as const;
export type PlatformKind = (typeof PLATFORM_KIND)[keyof typeof PLATFORM_KIND];

export const MATCH_STATUS = { OPEN: 'open', PLAYING: 'playing', DONE: 'done', CANCELLED: 'cancelled', VOID: 'void' } as const;

export interface PlatformPlayer {
  id: string;
  name: string;
  /** A PNG data URL, or null. */
  avatar: string | null;
}

export interface PlatformMatch {
  id: string;
  code: string;
  status: string;
  stake: number;
  seats: number;
  players: { id: string; name: string }[];
  me: string;
  winner: string | null;
}

/** A paid purchase. It is only a claim until our server has checked it with the platform. */
export interface PlatformPurchase {
  purchaseId: string;
  productId: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export interface Leaderboard {
  top: LeaderboardEntry[];
  me: { rank: number; label: string; score: number } | null;
}

/** The SDK, as documented. Every method returns a Promise. */
interface VatarSDK {
  init(): Promise<{ player: PlatformPlayer; session: string; mode: string }>;
  session(): Promise<{ session: string; exp: number }>;
  submitScore(score: number): Promise<{ best: number; accepted: boolean }>;
  leaderboard(): Promise<Leaderboard>;
  onPause(fn: () => void): () => void;
  onResume(fn: () => void): () => void;
  purchase(productId: string): Promise<PlatformPurchase>;
  purchases(): Promise<PlatformPurchase[]>;
  onPurchase(fn: (purchase: PlatformPurchase) => void): () => void;
  match: {
    create(options: { stake: number; seats: number }): Promise<PlatformMatch>;
    join(code: string): Promise<PlatformMatch>;
    quick(options: { stake: number }): Promise<PlatformMatch>;
    current(): Promise<PlatformMatch | null>;
    leave(): Promise<PlatformMatch | null>;
    onUpdate(fn: (match: PlatformMatch) => void): () => void;
  };
}

declare global {
  interface Window {
    Vatar?: VatarSDK;
  }
}

/** An SDK failure, carrying the platform's own short code (`cancelled`, `rate_limited`…). */
export class PlatformError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'PlatformError';
    this.code = code;
  }
}

const MESSAGES: Record<string, string> = {
  cancelled: 'Cancelled.',
  rate_limited: 'Slow down a moment, then try again.',
  too_soon: 'Slow down a moment, then try again.',
  not_available: 'Duels are not switched on for this game yet.',
  friendly_only: 'Only friendly matches are available right now.',
  not_found: 'No match was found with that code.',
  not_open: 'That match has already started or is full.',
  limit: 'You have reached today’s limit for matches.',
  signed_out: 'Sign in to Lagos Life to play.',
  busy: 'Finish what is open first, then try again.',
  payment_failed: 'The payment did not go through. Nothing was charged.',
  not_for_sale: 'That is not on sale right now.',
  off: 'Purchases are switched off right now.',
};
const FALLBACK_MESSAGE = 'Lagos Life could not do that just now. Please try again.';

function toPlatformError(cause: unknown): PlatformError {
  const code = typeof cause === 'object' && cause !== null && 'code' in cause ? String((cause as { code: unknown }).code) : 'error';
  return new PlatformError(code, MESSAGES[code] ?? FALLBACK_MESSAGE);
}

function loadSdk(): Promise<VatarSDK | null> {
  if (window.Vatar !== undefined) return Promise.resolve(window.Vatar);
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve(window.Vatar ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => window.setTimeout(() => reject(new PlatformError('timeout', FALLBACK_MESSAGE)), ms))]);
}

function devPlayer(): PlatformPlayer {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(DEV_ID_KEY);
  } catch {
    stored = null;
  }
  const id = stored ?? Math.random().toString(36).slice(2, 10);
  try {
    window.localStorage.setItem(DEV_ID_KEY, id);
  } catch {
    // The stand-in identity simply will not survive a refresh.
  }
  return { id, name: `Guest ${id.slice(0, 4).toUpperCase()}`, avatar: null };
}

export interface PlatformIdentity {
  kind: PlatformKind;
  player: PlatformPlayer;
}

let sdk: VatarSDK | null = null;
let identity: Promise<PlatformIdentity> | null = null;

async function connect(): Promise<PlatformIdentity> {
  const loaded = await loadSdk();
  if (loaded !== null) {
    try {
      const started = await timeout(loaded.init(), SDK_TIMEOUT_MS);
      sdk = loaded;
      return { kind: PLATFORM_KIND.LIVE, player: started.player };
    } catch (cause) {
      // Outside the platform's frame. In production that is the end of it.
      if (ENV.APP_ENV === 'production') throw toPlatformError(cause);
    }
  } else if (ENV.APP_ENV === 'production') {
    throw new PlatformError('error', FALLBACK_MESSAGE);
  }
  return { kind: PLATFORM_KIND.DEV, player: devPlayer() };
}

async function live<T>(call: (vatar: VatarSDK) => Promise<T>): Promise<T> {
  await platform.identify();
  if (sdk === null) throw new PlatformError('not_available', MESSAGES.not_available ?? FALLBACK_MESSAGE);
  try {
    return await call(sdk);
  } catch (cause) {
    throw toPlatformError(cause);
  }
}

export const platform = {
  /** Who is playing. Connects once; every later call returns the same answer. */
  identify(): Promise<PlatformIdentity> {
    identity ??= connect();
    return identity;
  },

  /** A fresh session token for one call to our server. They last 15 minutes. */
  async session(): Promise<string> {
    const who = await platform.identify();
    if (who.kind === PLATFORM_KIND.DEV || sdk === null) {
      return `${DEV_SESSION_PREFIX}${who.player.id}:${who.player.name}`;
    }
    try {
      return (await sdk.session()).session;
    } catch (cause) {
      throw toPlatformError(cause);
    }
  },

  /** Keeps the player's best. The platform accepts one score every 20 seconds. */
  submitScore: (score: number) => live((vatar) => vatar.submitScore(Math.max(0, Math.round(score)))),
  leaderboard: () => live((vatar) => vatar.leaderboard()),

  match: {
    create: (seats: number, stake: number) => live((vatar) => vatar.match.create({ stake, seats })),
    join: (code: string) => live((vatar) => vatar.match.join(code)),
    quick: (stake: number) => live((vatar) => vatar.match.quick({ stake })),
    current: () => live((vatar) => vatar.match.current()),
    leave: () => live((vatar) => vatar.match.leave()),
    /** Subscribe to match updates. Returns the unsubscribe function. */
    onUpdate(listener: (match: PlatformMatch) => void): () => void {
      return sdk === null ? () => undefined : sdk.match.onUpdate(listener);
    },
  },

  /**
   * Opens the platform's own pay sheet. The price and the name shown there are
   * the platform's, never ours. Outside the platform (preview mode) there is no
   * pay sheet, so a stand-in purchase is returned for the dev server to accept.
   */
  async purchase(productId: string): Promise<PlatformPurchase> {
    const who = await platform.identify();
    if (who.kind === PLATFORM_KIND.DEV || sdk === null) {
      return { purchaseId: `${DEV_PURCHASE_PREFIX}${productId}_${Math.random().toString(36).slice(2, 10)}`, productId };
    }
    return live((vatar) => vatar.purchase(productId));
  },
  /** Paid purchases our server has not marked delivered yet: a reload or a crash interrupted them. */
  async purchases(): Promise<PlatformPurchase[]> {
    await platform.identify();
    return sdk === null ? [] : live((vatar) => vatar.purchases());
  },
  /** A purchase confirmed while nothing was waiting for it, e.g. after returning from the payment page. */
  onPurchase: (listener: (purchase: PlatformPurchase) => void): (() => void) => (sdk === null ? () => undefined : sdk.onPurchase(listener)),

  /** Called when the game goes to the background or a platform sheet covers it. */
  onPause: (listener: () => void): (() => void) => (sdk === null ? () => undefined : sdk.onPause(listener)),
  onResume: (listener: () => void): (() => void) => (sdk === null ? () => undefined : sdk.onResume(listener)),
};
