import { ENV } from '@shared/config/env';

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    severity?: number;
    field_errors?: Record<string, string[]>;
  };
}

const HTTP_NO_CONTENT = 204;
const FALLBACK_CODE = 'network_error';
const FALLBACK_MESSAGE = 'We could not reach the game server. Check the connection and try again.';

/**
 * The error envelope's fields have one consumer each:
 *
 *   code     — branch on this, and ONLY this. It is the stable contract.
 *   message  — render this verbatim. Never hardcode a copy of it.
 *   severity — backend dashboards. Ignored in the UI.
 *
 * `rejection_reason` is deliberately not surfaced: it is an operator diagnostic
 * the backend may rename freely, so nothing here may branch on it.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(status: number, code: string, message: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(method: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${ENV.API_BASE_URL}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError(0, FALLBACK_CODE, FALLBACK_MESSAGE);
  }

  // 204 carries no body at all — parsing it is a client-side error.
  if (response.status === HTTP_NO_CONTENT) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as { data?: T } & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error?.code ?? FALLBACK_CODE,
      payload.error?.message ?? FALLBACK_MESSAGE,
      payload.error?.field_errors,
    );
  }

  return payload.data as T;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', path, undefined, signal),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
};
