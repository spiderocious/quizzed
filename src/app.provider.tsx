import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';


import { queryClient } from '@shared/services/query-client';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Global providers only. Feature-scoped state lives in the feature's own
 * provider — shared state across features is what causes cross-feature bugs.
 */
export function AppProvider({ children }: AppProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
