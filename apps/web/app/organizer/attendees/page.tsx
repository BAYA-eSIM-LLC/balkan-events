'use client';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerAttendees() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');

  const load = () => {
    if (!eventId) return;
    adminFetch(`/organizer/events/${eventId}/attendees?page=1&page_size=20`)
      .then(d => setItems(d.items || []))
      .catch(e => setError(e.message));
  };

  const exportCsv = () => {
    if (!eventId) return;
    window.open(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/organizer/events/${eventId}/attendees/export`, '_blank');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sudionici</h1>
      <p className="text-zinc-400 text-sm mb-4">Samo vlastiti događaj · ograničeni podaci</p>
      <div className="flex gap-2 mb-4">
        <input value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button onClick={load} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Učitaj</button>
        <button onClick={exportCsv} className="bg-white/10 px-4 py-2 rounded-lg text-sm">CSV</button>
      </div>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      <div className="space-y-2">
        {items.map(a => (
          <div key={a.ticket_id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm">
            <p className="font-mono text-xs">{a.code}</p>
            <p className="text-xs text-zinc-400">{a.status} · {a.used_at || 'nije iskorištena'}</p>
          </div>
        ))}
        {items.length === 0 && !error && <p className="text-zinc-400 text-sm">Unesi Event ID.</p>}
      </div>
    </div>
  );
}
