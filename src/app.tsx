import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { platform } from '@shared/services/platform';
import { sound } from '@shared/services/sound';

import { AppProvider } from './app.provider';
import { router } from './app.routes';

export function App() {
  // Browsers only allow audio after a gesture. The first tap anywhere unlocks
  // it, so by the time a game starts the sounds are ready.
  useEffect(() => {
    const unlock = (): void => sound.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Inside Lagos Life the game is paused when it goes to the background or a
  // platform sheet covers it. Sound stops with it.
  useEffect(() => {
    let stop: (() => void)[] = [];
    let cancelled = false;
    void platform
      .identify()
      .then(() => {
        if (cancelled) return;
        stop = [platform.onPause(() => sound.setPaused(true)), platform.onResume(() => sound.setPaused(false))];
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      stop.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
