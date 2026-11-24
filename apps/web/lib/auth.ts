const API = process.env.NEXT_PUBLIC_API_URL || '/api';
let refreshPromise: Promise<string | null> | null = null;

export function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
}

export function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
}

async function doRefresh(): Promise<string | null> {
  const rt = getRefreshToken();
  if (!rt) return null;
  try {
    const r = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: rt }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    setTokens(d.access_token, d.refresh_token);
    return d.access_token;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  let res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newToken}`,
        ...options.headers,
      };
      res = await fetch(`${API}${path}`, { ...options, headers: retryHeaders });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
      }
    }
  }
  return res;
}
