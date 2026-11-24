'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/organizer/events')
      .then(setEvents)
      .catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Događaji</h1>
      <p className="text-zinc-400 text-sm mb-4">Samo vlastiti događaji</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-zinc-400">{e.status} · {e.start_at ? new Date(e.start_at).toLocaleDateString('bs-BA') : '—'}</p>
          </div>
        ))}
        {!error && events.length === 0 && <p className="text-zinc-400 text-sm">Nema događaja.</p>}
      </div>
    </div>
  );
}
