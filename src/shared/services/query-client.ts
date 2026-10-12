import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-client';

const MAX_RETRY_COUNT = 2;
const HTTP_SERVER_ERROR = 500;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // A client error will not succeed on retry. A dropped connection might.
        if (error instanceof ApiError && error.status > 0 && error.status < HTTP_SERVER_ERROR) return false;
        return failureCount < MAX_RETRY_COUNT;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
