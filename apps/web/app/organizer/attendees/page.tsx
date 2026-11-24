'use client';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerAttendees() {
  const { events, activeOrg, loading } = useOrganizer();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');

  const load = () => {
    if (!eventId) return;
    adminFetch(`/organizer/events/${eventId}/attendees?page=1&page_size=50`)
      .then(d => setItems(d.items || []))
      .catch(e => setError(e.message));
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sudionici</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="flex gap-2 mb-4 max-w-md">
        <select value={eventId} onChange={e => setEventId(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi događaj</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <button onClick={load} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Učitaj</button>
      </div>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      <div className="space-y-2">
        {items.map((a: any) => (
          <div key={a.id || a.ticket_id} className="bg-white/5 rounded-lg p-3 text-sm">{a.code || a.email || a.ticket_id} · {a.is_used ? 'Iskorištena' : 'Valjana'}</div>
        ))}
        {items.length === 0 && eventId && <p className="text-zinc-500 text-sm">Nema sudionika ili klikni Učitaj.</p>}
      </div>
    </div>
  );
}
