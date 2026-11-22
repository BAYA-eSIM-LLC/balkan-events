// Client (browser) uses relative /api (nginx proxy).
// Server (SSR) uses internal Docker URL so server components can reach the API.
const isServer = typeof window === 'undefined';
export const API = isServer
  ? (process.env.INTERNAL_API_URL || 'http://api:8000')
  : (process.env.NEXT_PUBLIC_API_URL || '/api');

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  city?: string;
  country?: string;
  venue_name?: string;
  start_at: string;
  end_at?: string;
  timezone?: string;
  image_url?: string;
  is_featured?: boolean;
  status?: string;
}

export async function fetchEvents(path: string): Promise<EventItem[]> {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.results || [];
  } catch {
    return [];
  }
}

export async function fetchEventBySlug(slug: string): Promise<EventItem | null> {
  try {
    const res = await fetch(`${API}/events/slug/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function formatDate(iso: string, tz = 'Europe/Sarajevo') {
  try {
    return new Date(iso).toLocaleString('bs-BA', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}
