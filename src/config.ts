// API base configuration
// Normalizes the API base URL from VITE_API_URL (stripping trailing /api or slashes).
// In development, defaults to 'http://localhost:4000'.
// In production, defaults to '' (relative path) so frontend & backend hosted together
// on Render or behind a reverse proxy work seamlessly without domain hardcoding.

export function normalizeApiBase(rawUrl?: string, isDev = false): string {
  const trimmed = (rawUrl || '').trim();
  if (trimmed) {
    return trimmed.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  }
  return isDev ? 'http://localhost:4000' : '';
}

const envApiUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_URL : undefined;
const isDevMode = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : false;

export const API_BASE = normalizeApiBase(envApiUrl, isDevMode);

export function formatApiError(err: any, fallback = 'Server connection error.'): string {
  const msg = err?.message || (typeof err === 'string' ? err : '');
  if (!msg || msg === 'Failed to fetch' || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
    return 'Unable to connect to the backend server. Please make sure the backend server is running on port 4000 (npm run server).';
  }
  return msg || fallback;
}
