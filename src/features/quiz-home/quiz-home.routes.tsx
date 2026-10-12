import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { ROUTES } from '@shared/constants/routes';

const QuizHomeScreen = lazy(() => import('./screen/quiz-home-screen'));

export const quizHomeRoutes: RouteObject[] = [{ path: ROUTES.HOME, element: <QuizHomeScreen /> }];
