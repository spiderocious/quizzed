import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { PhonePrefsProvider, PlayerFinal, PlayerIntro, PlayerQuestion, PlayerReveal, usePlayerFeedback } from '@features/player';
import { PATHS } from '@shared/constants/routes';
import { CLIENT_MESSAGE, ROLE, ROOM_PHASE, type RoomPlayer, type RoomState } from '@shared/realtime/protocol';
import { CONNECTION, useRoomSocket } from '@shared/realtime/room-socket-context';
import { RoomSocketProvider } from '@shared/realtime/room-socket-provider';
import { sessionStore } from '@shared/services/session-store';
import { ANSWER_RESULT, QUIZ_PHASE, type QuizView } from '@shared/types/quiz';
import { ConnectionBadge } from '@shared/ui/ConnectionBadge';
import { LoadingScreen } from '@shared/ui/LoadingScreen';
import { MessageScreen } from '@shared/ui/MessageScreen';
import { BACKDROP, PartyBackdrop } from '@shared/ui/PartyBackdrop';

import { ARENA_MODE, type ArenaMode } from '../arena.types';

import { ArenaFinish } from './parts/ArenaFinish';
import { ArenaHeader } from './parts/ArenaHeader';
import { ArenaWaiting } from './parts/ArenaWaiting';

type Tone = (typeof BACKDROP)[keyof typeof BACKDROP];

const SOLO_HEADLINE = { emoji: '⚡', title: 'Run complete!' };

function toneFor(game: QuizView | null): Tone {
  if (game === null) return BACKDROP.STAGE;
  if (game.phase === QUIZ_PHASE.REVEAL) {
    if (game.you?.result === ANSWER_RESULT.CORRECT) return BACKDROP.GO;
    if (game.you?.result === ANSWER_RESULT.WRONG) return BACKDROP.DANGER;
    return BACKDROP.BERRY;
  }
  return game.phase === QUIZ_PHASE.INTRO ? BACKDROP.BERRY : BACKDROP.STAGE;
}

interface BodyProps {
  mode: ArenaMode;
  state: RoomState;
  me: RoomPlayer;
}

function Body({ mode, state, me }: BodyProps) {
  const { room, game } = state;

  if (room.phase === ROOM_PHASE.LOBBY || game === null) {
    return mode === ARENA_MODE.SOLO ? (
      <ArenaWaiting title="Ready?" hint="Here it comes…" players={room.players} />
    ) : (
      <ArenaWaiting title="Match found!" hint="Starting as soon as everyone is in…" players={room.players} />
    );
  }

  switch (game.phase) {
    case QUIZ_PHASE.INTRO:
      return <PlayerIntro game={game} />;
    case QUIZ_PHASE.QUESTION:
      // Keyed by question so the "I tapped this" state cannot leak into the next one.
      return game.question === null ? null : <PlayerQuestion key={game.question_seq} game={game} question={game.question} />;
    case QUIZ_PHASE.REVEAL:
    case QUIZ_PHASE.LEADERBOARD:
    case QUIZ_PHASE.ROUND_END:
      return <PlayerReveal game={game} />;
    case QUIZ_PHASE.FINISHED:
      return game.final === null ? null : (
        <PlayerFinal
          final={game.final}
          myId={me.id}
          footer={<ArenaFinish mode={mode} game={game} myId={me.id} />}
          // Alone, you are always "1st". Say something true instead.
          {...(mode === ARENA_MODE.SOLO ? { headline: SOLO_HEADLINE } : {})}
        />
      );
    default:
      return null;
  }
}

interface ArenaProps {
  mode: ArenaMode;
  code: string;
}

function Arena({ mode, code }: ArenaProps) {
  const { status, state, send } = useRoomSocket();
  usePlayerFeedback(state?.game ?? null);

  // A solo player owns their room, and there is no host screen to press Start:
  // the game begins as soon as they are connected. (A duel is started by the
  // server once its players are seated.)
  const started = useRef(false);
  const waitingInLobby = state !== null && state.room.phase === ROOM_PHASE.LOBBY;
  useEffect(() => {
    if (mode !== ARENA_MODE.SOLO || !waitingInLobby || started.current) return;
    started.current = true;
    send(CLIENT_MESSAGE.HOST_START);
  }, [mode, waitingInLobby, send]);

  const back = (
    <Link to={PATHS.home} className="font-display text-[20px] font-extrabold text-stage underline">
      Back to the start
    </Link>
  );

  if (status === CONNECTION.CLOSED || status === CONNECTION.GONE || status === CONNECTION.REJECTED) {
    sessionStore.clearSeat(code);
    return <MessageScreen emoji="👋" title="That game is over" message="It has ended or timed out. Start a new one whenever you like." action={back} />;
  }
  if (state === null) return <LoadingScreen label="Getting your game ready…" />;

  const me = state.room.players.find((player) => player.id === state.you.player_id);
  if (me === undefined) return <LoadingScreen label="Finding your seat…" />;

  const inGame = state.room.phase !== ROOM_PHASE.LOBBY && state.game !== null;

  return (
    <PartyBackdrop tone={toneFor(inGame ? state.game : null)}>
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col">
        <ArenaHeader me={me} game={inGame ? state.game : null} />
        <Body mode={mode} state={state} me={me} />
      </div>
      <ConnectionBadge />
    </PartyBackdrop>
  );
}

interface ArenaPlayScreenProps {
  mode: ArenaMode;
}

/**
 * One phone, no big screen: the question, the answers and the result all live
 * here. Used for a solo run and for a duel — the same screens, with a
 * different beginning and end.
 */
export default function ArenaPlayScreen({ mode }: ArenaPlayScreenProps) {
  const { code = '' } = useParams();
  const roomCode = code.toUpperCase();
  const seat = sessionStore.getSeat(roomCode);

  if (seat === null) {
    return <Navigate to={mode === ARENA_MODE.SOLO ? PATHS.solo : PATHS.duel} replace />;
  }

  return (
    // With no big screen, the phone is the only place the question can be read.
    <PhonePrefsProvider alwaysShow>
      <RoomSocketProvider code={roomCode} role={ROLE.PLAYER} token={seat.token}>
        <Arena mode={mode} code={roomCode} />
      </RoomSocketProvider>
    </PhonePrefsProvider>
  );
}
