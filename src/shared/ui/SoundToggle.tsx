import { Show } from 'meemaw';
import { useEffect, useState } from 'react';


import { Volume2, VolumeX } from '@icons';
import { sound } from '@shared/services/sound';
import { cn } from '@shared/utils/cn';

interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const [muted, setMuted] = useState(() => sound.isMuted());

  useEffect(() => sound.subscribe(setMuted), []);

  return (
    <button
      type="button"
      aria-pressed={muted}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      onClick={() => {
        sound.unlock();
        sound.setMuted(!muted);
      }}
      className={cn(
        'inline-flex h-11 w-11 items-center justify-center rounded-full border-3 border-ink bg-surface text-ink shadow-pop-sm transition-transform active:translate-y-1 active:shadow-none',
        className,
      )}
    >
      <Show when={muted} fallback={<Volume2 size={20} strokeWidth={3} aria-hidden="true" />}>
        <VolumeX size={20} strokeWidth={3} aria-hidden="true" />
      </Show>
    </button>
  );
}
