import { authFetch, clearTokens } from './auth';

export async function adminFetch(path: string, options: RequestInit = {}) {
  const res = await authFetch(path, options);
  if (!res.ok) {
    if (res.status === 401) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
      }
      throw new Error('Sesija istekla.');
    }
    const text = await res.text();
    throw new Error(res.status === 404 ? 'Admin API nije dostupan' : `HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}
