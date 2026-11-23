'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/events/moderation?status=SUBMITTED')
      .then(d => setEvents(Array.isArray(d) ? d : d.items || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Moderacija događaja</h1>
      <p className="text-zinc-400 text-sm mb-6">SUBMITTED događaji čekaju odobrenje</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {!loading && !error && events.length === 0 && <p className="text-zinc-400 text-sm">Nema događaja na moderaciji.</p>}
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{e.title || e.name}</p>
              <p className="text-xs text-zinc-400">{e.status} · {e.city || '—'}</p>
            </div>
            <button className="text-xs bg-purple-600 px-3 py-1.5 rounded-lg">Odobri</button>
          </div>
        ))}
      </div>
    </div>
  );
}
