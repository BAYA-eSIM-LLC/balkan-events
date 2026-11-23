const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(res.status === 404 ? 'Admin API nije dostupan' : `HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}
