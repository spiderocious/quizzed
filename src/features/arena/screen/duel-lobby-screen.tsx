
import { useMutation } from '@tanstack/react-query';
import { Repeat, Show } from 'meemaw';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { ArrowLeft, Users, Zap } from '@icons';
import { PATHS } from '@shared/constants/routes';
import { MATCH_STATUS, platform, PLATFORM_KIND, type PlatformError, type PlatformMatch } from '@shared/services/platform';
import { sessionStore } from '@shared/services/session-store';
import { Button, BUTTON_SIZE, BUTTON_VARIANT } from '@shared/ui/Button';
import { Card } from '@shared/ui/Card';
import { InlineError } from '@shared/ui/InlineError';
import { LoadingScreen } from '@shared/ui/LoadingScreen';
import { BACKDROP, PartyBackdrop } from '@shared/ui/PartyBackdrop';
import { Segmented } from '@shared/ui/Segmented';

import { useJoinMatch } from '../api/use-join-match';
import { usePlatformIdentity } from '../api/use-platform-identity';

const CODE_LENGTH = 6;
// 0 is a friendly match. Anything else is staked in Lagos Life's in-game naira
// — never real money — and only once the platform has approved staking here.
const STAKES = [0, 100, 500, 1000];
const SEATS = [2, 3, 4];

const stakeLabel = (stake: number): string => (stake === 0 ? 'Friendly' : `₦${stake.toLocaleString()}`);

/**
 * Find or make a match on Lagos Life. The platform owns the matchmaking and
 * the stakes; this screen only asks it, then waits. The moment the platform
 * says the match is playing, the phone takes its seat in our room.
 */
export default function DuelLobbyScreen() {
  const navigate = useNavigate();
  const identity = usePlatformIdentity();
  const joinRoom = useJoinMatch();
  const [match, setMatch] = useState<PlatformMatch | null>(null);
  const [stake, setStake] = useState(0);
  const [seats, setSeats] = useState(2);
  const [code, setCode] = useState('');
  const [devMatchId, setDevMatchId] = useState('');
  const entering = useRef('');

  const live = identity.data?.kind === PLATFORM_KIND.LIVE;

  const request = useMutation<PlatformMatch | null, PlatformError, () => Promise<PlatformMatch | null>>({
    mutationFn: (call) => call(),
    onSuccess: (result) => setMatch(result),
  });

  // Pick up a match already in progress (after a refresh), then follow it.
  useEffect(() => {
    if (!live) return undefined;
    let cancelled = false;
    void platform.match
      .current()
      .then((current) => {
        if (!cancelled && current !== null) setMatch(current);
      })
      .catch(() => undefined);
    const unsubscribe = platform.match.onUpdate((update) => setMatch(update));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [live]);

  const enterRoom = (matchId: string): void => {
    if (entering.current === matchId) return;
    entering.current = matchId;
    joinRoom.mutate(matchId, {
      onSuccess: (seat) => {
        sessionStore.setSeat(seat.code, { playerId: seat.player_id, token: seat.player_token, name: seat.name, avatar: seat.avatar });
        navigate(PATHS.duelPlay(seat.code));
      },
      onError: () => {
        entering.current = '';
      },
    });
  };

  // Stakes are locked in once the platform says "playing" — only then do we play.
  const playingId = match?.status === MATCH_STATUS.PLAYING ? match.id : '';
  useEffect(() => {
    if (playingId !== '') enterRoom(playingId);
    // enterRoom is stable in everything that matters here; the match id is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingId]);

  if (identity.isPending) return <LoadingScreen label="Connecting to Lagos Life…" />;

  const waiting = match !== null && match.status === MATCH_STATUS.OPEN;
  const error = request.error?.message ?? joinRoom.error?.message;

  const submitCode = (event: FormEvent): void => {
    event.preventDefault();
    if (code.length === CODE_LENGTH) request.mutate(() => platform.match.join(code));
  };

  return (
    <PartyBackdrop tone={BACKDROP.BERRY}>
      <main className="safe-top mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col gap-4 px-4 pb-6 pt-4">
        <header className="flex items-center gap-3">
          <Link
            to={PATHS.home}
            aria-label="Back"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-surface text-ink shadow-pop-sm transition-transform active:translate-y-1 active:shadow-none"
          >
            <ArrowLeft size={20} strokeWidth={3} aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[30px] leading-none">Duel</h1>
            <p className="mt-1 text-[14px] font-bold opacity-90">Same questions, same clock. Most points wins.</p>
          </div>
        </header>

        <Show when={error !== undefined}>
          <InlineError message={error ?? ''} />
        </Show>

        <Show when={waiting}>
          <Card big className="flex animate-pop-in flex-col items-center gap-4 p-6 text-center text-ink">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-ink-3">Share this code</p>
            <p className="font-display text-[clamp(34px,11vw,52px)] font-extrabold leading-none tracking-[0.16em]">{match?.code}</p>
            <p className="font-display text-[18px] font-bold">
              {match?.players.length} of {match?.seats} in · {stakeLabel(match?.stake ?? 0)}
            </p>
            <ul className="flex flex-wrap justify-center gap-2">
              <Repeat each={match?.players ?? []}>
                {(player) => (
                  <li key={player.id} className="rounded-full border-2 border-ink bg-sun px-3 py-1 font-display text-[16px] font-extrabold">
                    {player.name}
                  </li>
                )}
              </Repeat>
            </ul>
            <p className="animate-wiggle font-display text-[17px] font-extrabold text-ink-3">Waiting for players…</p>
            <Button variant={BUTTON_VARIANT.PLAIN} disabled={request.isPending} onClick={() => request.mutate(() => platform.match.leave().then(() => null))}>
              Leave match
            </Button>
          </Card>
        </Show>

        <Show when={live && !waiting}>
          <Card className="flex flex-col gap-4 p-4 text-ink">
            <section className="flex flex-col gap-2">
              <h2 className="font-display text-[20px] font-extrabold">Play for</h2>
              <Segmented label="Stake" value={stake} options={STAKES.map((s) => ({ value: s, label: stakeLabel(s) }))} onChange={setStake} className="grid grid-cols-2" />
              <p className="text-[13px] font-semibold text-ink-3">Stakes are Lagos Life in-game naira. Winner takes the pot; a tie returns it.</p>
            </section>

            <Button
              size={BUTTON_SIZE.XL}
              disabled={request.isPending}
              icon={<Zap size={26} strokeWidth={3} fill="currentColor" aria-hidden="true" />}
              onClick={() => request.mutate(() => platform.match.quick(stake))}
            >
              Quick match
            </Button>

            <section className="flex flex-col gap-2 border-t-3 border-ink-5 pt-4">
              <h2 className="font-display text-[20px] font-extrabold">Play with friends</h2>
              <Segmented label="Players" value={seats} options={SEATS.map((s) => ({ value: s, label: `${s} players` }))}
                className="grid grid-cols-3" onChange={setSeats} />
              <Button
                variant={BUTTON_VARIANT.STAGE}
                size={BUTTON_SIZE.LG}
                disabled={request.isPending}
                icon={<Users size={22} strokeWidth={3} aria-hidden="true" />}
                onClick={() => request.mutate(() => platform.match.create(seats, stake))}
              >
                Create a match
              </Button>
            </section>

            <form onSubmit={submitCode} className="flex flex-col gap-2 border-t-3 border-ink-5 pt-4">
              <h2 className="font-display text-[20px] font-extrabold">Got a code?</h2>
              <div className="flex gap-2">
                <input
                  aria-label="Match code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH))}
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="ABCDEF"
                  className="h-14 min-w-0 flex-1 rounded-btn border-3 border-ink bg-canvas-tint text-center font-display text-[26px] font-extrabold uppercase tracking-[0.2em] placeholder:text-ink-5"
                />
                <Button type="submit" variant={BUTTON_VARIANT.SUN} size={BUTTON_SIZE.LG} disabled={code.length !== CODE_LENGTH || request.isPending}>
                  Join
                </Button>
              </div>
            </form>
          </Card>
        </Show>

        <Show when={!live}>
          <Card className="flex flex-col gap-3 p-4 text-ink">
            <h2 className="font-display text-[22px] font-extrabold">Preview mode</h2>
            <p className="text-[15px] font-semibold text-ink-3">
              Real duels are matched by Lagos Life, so they only work inside it. To try one here, open this page in two
              windows and type the same match name in both.
            </p>
            <form
              className="flex flex-col gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (devMatchId.trim() !== '') enterRoom(devMatchId.trim());
              }}
            >
              <input
                aria-label="Test match name"
                value={devMatchId}
                onChange={(event) => setDevMatchId(event.target.value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 20))}
                placeholder="e.g. test-1"
                className="h-12 w-full min-w-0 rounded-btn border-3 border-ink bg-canvas-tint px-3 font-display text-[20px] font-extrabold placeholder:text-ink-5"
              />
              <Button type="submit" disabled={devMatchId.trim() === '' || joinRoom.isPending}>
                Join test match
              </Button>
            </form>
          </Card>
        </Show>
      </main>
    </PartyBackdrop>
  );
}
