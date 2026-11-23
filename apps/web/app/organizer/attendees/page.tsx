'use client';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerAttendees() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');

  const load = () => {
    if (!eventId) return;
    adminFetch(`/organizer/events/${eventId}/attendees`)
      .then(d => setItems(Array.isArray(d) ? d : d.items || []))
      .catch(e => setError(e.message));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sudionici</h1>
      <p className="text-zinc-400 text-sm mb-4">Kupci i status ulaznica – samo vlastiti događaj</p>
      <div className="flex gap-2 mb-4">
        <input value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button onClick={load} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Učitaj</button>
      </div>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      <div className="space-y-2">
        {items.map((a, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm">
            <p>{a.email || a.user_email || '—'}</p>
            <p className="text-xs text-zinc-400">Ulaznica: {a.ticket_code || '—'} · Status: {a.status || '—'}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-500 mt-4">Endpoint čeka implementaciju /organizer/events/{'{id}'}/attendees (izolacija po organizaciji).</p>
    </div>
  );
}
