import { Suspense } from 'react';
import { createBrowserRouter, Outlet, type RouteObject } from 'react-router-dom';

import { arenaRoutes } from '@features/arena';
import { quizHomeRoutes } from '@features/quiz-home';
import { PATHS } from '@shared/constants/routes';
import { Button } from '@shared/ui/Button';
import { LoadingScreen } from '@shared/ui/LoadingScreen';
import { MessageScreen } from '@shared/ui/MessageScreen';

function RootLayout() {
  return (
    <Suspense fallback={<LoadingScreen label="Setting up the room…" />}>
      <Outlet />
    </Suspense>
  );
}

function goHome(): void {
  window.location.assign(PATHS.home);
}

function NotFound() {
  return (
    <MessageScreen
      emoji="🧭"
      title="Nothing here"
      message="That page does not exist. Head back and start a game."
      action={<Button onClick={goHome}>Back to the start</Button>}
    />
  );
}

function RouteError() {
  return (
    <MessageScreen
      emoji="🙈"
      title="That broke"
      message="Something went wrong on this screen. Going back to the start usually sorts it out."
      action={<Button onClick={goHome}>Back to the start</Button>}
    />
  );
}

const features: RouteObject[] = [...quizHomeRoutes, ...arenaRoutes];

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [...features, { path: '*', element: <NotFound /> }],
  },
]);
