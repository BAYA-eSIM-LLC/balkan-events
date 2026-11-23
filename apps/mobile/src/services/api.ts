import Constants from 'expo-constants';
import { TokenResponse, ApiError } from '../types';
import { getAccess, getRefresh, saveTokens, clearTokens } from './tokenStore';

const BASE = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || '';
if (!BASE) {
  console.warn('EXPO_PUBLIC_API_URL is not set. API calls will fail until it is configured.');
}

let refreshing: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const rt = await getRefresh();
  if (!rt) return null;
  const r = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  if (!r.ok) {
    await clearTokens();
    return null;
  }
  const data: TokenResponse = await r.json();
  await saveTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const token = await getAccess();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let r = await fetch(`${BASE}${path}`, { ...init, headers, signal: controller.signal });

    if (r.status === 401 && !path.startsWith('/auth/')) {
      if (!refreshing) refreshing = refreshAccess().finally(() => { refreshing = null; });
      const next = await refreshing;
      if (!next) { await clearTokens(); throw { status: 401, detail: 'Session expired' } as ApiError; }
      headers.Authorization = `Bearer ${next}`;
      r = await fetch(`${BASE}${path}`, { ...init, headers, signal: controller.signal });
    }

    if (!r.ok) {
      let detail = r.statusText;
      try { const d = await r.json(); detail = d.detail || detail; } catch {}
      throw { status: r.status, detail } as ApiError;
    }
    if (r.status === 204) return undefined as T;
    return r.json();
  } catch (e: any) {
    if (e.name === 'AbortError') throw { status: 0, detail: 'Request timed out' } as ApiError;
    if (e.status) throw e;
    throw { status: 0, detail: 'Network error' } as ApiError;
  } finally {
    clearTimeout(timer);
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    api<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, full_name: string) =>
    api<TokenResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) }),
  logout: async () => {
    const rt = await getRefresh();
    if (rt) {
      try { await api('/auth/logout', { method: 'POST', body: JSON.stringify({ refresh_token: rt }) }); } catch {}
    }
    await clearTokens();
  },
  forgot: (email: string) =>
    api('/profile/forgot-password', { method: 'POST', body: JSON.stringify(email) }),
};

export { BASE as API_BASE };
