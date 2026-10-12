function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

/**
 * Where the API is, as seen from THIS device.
 *
 * The configured URL usually says localhost, which is right on the machine
 * running the game and wrong on every phone that joins over wifi: on a phone,
 * localhost is the phone. So when the page was opened at a network address but
 * the API is configured as localhost, the API is assumed to be on the same
 * machine as the page, and its host is swapped for the page's.
 */
function resolveApiBase(configured: string): string {
  const url = new URL(configured);
  const pageHost = window.location.hostname;
  if (LOCAL_HOSTS.includes(url.hostname) && !LOCAL_HOSTS.includes(pageHost)) {
    url.hostname = pageHost;
  }
  return url.origin;
}

const apiBaseUrl = resolveApiBase(requireEnv('VITE_API_BASE_URL'));

export const ENV = {
  API_BASE_URL: apiBaseUrl,
  // The realtime gateway lives on the same host as the API.
  WS_BASE_URL: apiBaseUrl.replace(/^http/, 'ws'),
  APP_ENV: import.meta.env.VITE_APP_ENV ?? 'development',
} as const;
