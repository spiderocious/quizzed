import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ROUTES } from '@shared/constants/routes';

import { ARENA_MODE } from './arena.types';

const SoloSetupScreen = lazy(() => import('./screen/solo-setup-screen'));
const DuelLobbyScreen = lazy(() => import('./screen/duel-lobby-screen'));
const ArenaPlayScreen = lazy(() => import('./screen/arena-play-screen'));

export const arenaRoutes: RouteObject[] = [
  // Literal paths before the ones with a :code.
  { path: ROUTES.SOLO, element: <SoloSetupScreen /> },
  { path: ROUTES.DUEL, element: <DuelLobbyScreen /> },
  { path: ROUTES.SOLO_PLAY, element: <ArenaPlayScreen mode={ARENA_MODE.SOLO} /> },
  { path: ROUTES.DUEL_PLAY, element: <ArenaPlayScreen mode={ARENA_MODE.DUEL} /> },
];
