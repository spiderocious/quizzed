import type { QuizConfig, QuizView } from '@shared/types/quiz';

/**
 * The realtime protocol, mirroring backend engine/protocol.go. Message names
 * are named constants on both sides — never an inline string at a callsite.
 */

/** Client → server, handled by the room itself. */
export const CLIENT_MESSAGE = {
  HOST_CONFIGURE: 'host.configure',
  HOST_START: 'host.start',
  HOST_PLAY_AGAIN: 'host.play_again',
  HOST_BACK_TO_LOBBY: 'host.back_to_lobby',
  HOST_CLOSE_ROOM: 'host.close_room',
  PLAYER_REACT: 'player.react',
} as const;

export const SERVER_MESSAGE = {
  STATE: 'server.state',
  ERROR: 'server.error',
  REACTION: 'server.reaction',
  CLOSED: 'server.closed',
} as const;

export const ROOM_PHASE = { LOBBY: 'lobby', PLAYING: 'playing', CLOSED: 'closed' } as const;
export type RoomPhase = (typeof ROOM_PHASE)[keyof typeof ROOM_PHASE];

export const ROLE = { HOST: 'host', PLAYER: 'player' } as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

/** Reactions a phone may send to the big screen. Mirrors engine.Reactions. */
export const REACTIONS = ['😂', '🔥', '👏', '😱', '🤔', '❤️'] as const;

export interface RoomPlayer {
  id: string;
  name: string;
  avatar: string;
  connected: boolean;
}

export interface RoomFact {
  label: string;
  value: string;
}

export interface RoomView {
  code: string;
  phase: RoomPhase;
  game_id: string;
  game_title: string;
  join_url: string;
  host_connected: boolean;
  players: RoomPlayer[];
  config: QuizConfig;
  facts: RoomFact[];
}

export interface RoomState {
  /** The server clock when this was sent. */
  now: number;
  room: RoomView;
  you: { role: Role; player_id?: string };
  game: QuizView | null;
}

export interface SocketError {
  code: string;
  message: string;
}

export interface Reaction {
  player_id: string;
  emoji: string;
}

export interface ServerEnvelope {
  type: string;
  state?: RoomState;
  error?: SocketError;
  reaction?: Reaction;
}
