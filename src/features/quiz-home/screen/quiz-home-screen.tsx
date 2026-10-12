import { Repeat, Show } from 'meemaw';
import { useNavigate } from 'react-router-dom';

import { usePlatformIdentity } from '@features/arena';
import { Play, Users } from '@icons';
import { PATHS } from '@shared/constants/routes';
import { PLATFORM_KIND } from '@shared/services/platform';
import { Button, BUTTON_SIZE, BUTTON_VARIANT } from '@shared/ui/Button';
import { LoadingScreen } from '@shared/ui/LoadingScreen';
import { Logo, LOGO_SIZE } from '@shared/ui/Logo';
import { MessageScreen } from '@shared/ui/MessageScreen';
import { BACKDROP, PartyBackdrop } from '@shared/ui/PartyBackdrop';
import { SoundToggle } from '@shared/ui/SoundToggle';
import { cn } from '@shared/utils/cn';

// What makes a score: said once, up front, in three stickers.
const PERKS = [
  { emoji: '⚡', label: 'Speed bonus', className: 'bg-sun text-ink -rotate-2' },
  { emoji: '🔥', label: 'Streaks', className: 'bg-accent text-white rotate-1' },
  { emoji: '🎯', label: 'Harder pays more', className: 'bg-surface text-ink -rotate-1' },
] as const;


/**
 * The front door of the quiz on Lagos Life. No sign-in and no name to type:
 * the platform has already said who is playing. Two ways to play — alone
 * against the clock, or against other people.
 */
export default function QuizHomeScreen() {
  const navigate = useNavigate();
  const player = usePlatformIdentity();

  if (player.isPending) return <LoadingScreen label="Connecting to Lagos Life…" />;
  if (player.isError) {
    return <MessageScreen emoji="🔌" title="Not connected" message={player.error.message} tone={BACKDROP.STAGE} />;
  }

  const preview = player.data.kind === PLATFORM_KIND.DEV;

  return (
    <PartyBackdrop tone={BACKDROP.STAGE}>
      <SoundToggle className="safe-top absolute right-4 top-4 z-20" />
      <main className="safe-top mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col items-center gap-6 px-5 pb-6 pt-20 text-center [@media(max-height:640px)]:gap-4 [@media(max-height:640px)]:pt-16">
        <div className="flex flex-col items-center gap-3">
          <h1 className="animate-drop-in">
            <Logo size={LOGO_SIZE.MD} />
          </h1>
          <p className="font-display text-[22px] font-bold leading-tight">Hello, {player.data.player.name} 👋</p>
          <p className="max-w-[26ch] text-[16px] font-bold opacity-90">Be right. Be quick. The faster the answer, the bigger the score.</p>
        </div>

        <ul className="flex flex-wrap justify-center gap-2 [@media(max-height:640px)]:hidden">
          <Repeat each={[...PERKS]}>
            {(perk, index) => (
              <li
                key={perk.label}
                style={{ ['--i' as string]: index }}
                className={cn('stagger animate-pop-in rounded-full border-3 border-ink px-3 py-1.5 font-display text-[15px] font-extrabold shadow-pop-sm', perk.className)}
              >
                {perk.emoji} {perk.label}
              </li>
            )}
          </Repeat>
        </ul>

        <div className="my-auto flex w-full flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Button size={BUTTON_SIZE.XL} icon={<Play size={28} strokeWidth={3} fill="currentColor" aria-hidden="true" />} onClick={() => navigate(PATHS.solo)}>
              Solo run
            </Button>
            <p className="pt-2 text-[14px] font-bold opacity-90">Ten questions against the clock.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant={BUTTON_VARIANT.SUN} size={BUTTON_SIZE.XL} icon={<Users size={28} strokeWidth={3} aria-hidden="true" />} onClick={() => navigate(PATHS.duel)}>
              Duel
            </Button>
            <p className="pt-2 text-[14px] font-bold opacity-90">Two to four players. Most points wins.</p>
          </div>
        </div>

        <Show when={preview} fallback={<p className="text-[14px] font-bold opacity-80">Your best solo score goes on the leaderboard.</p>}>
          <p className="rounded-chip border-2 border-white/50 bg-white/15 px-3 py-2 text-[13px] font-bold">
            Preview mode — you are outside Lagos Life, so scores are not saved and duels are test-only.
          </p>
        </Show>
      </main>
    </PartyBackdrop>
  );
}
