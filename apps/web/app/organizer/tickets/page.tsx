'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerTickets() {
  const [types, setTypes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState('');

  const load = () => {
    if (!eventId) return;
    adminFetch(`/organizer/events/${eventId}/ticket-types`)
      .then(d => setTypes(Array.isArray(d) ? d : d.items || []))
      .catch(e => setError(e.message));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Vrste ulaznica</h1>
      <p className="text-zinc-400 text-sm mb-4">CRUD za TicketType – samo vlastiti događaji</p>
      <div className="flex gap-2 mb-4">
        <input value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button onClick={load} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Učitaj</button>
      </div>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="space-y-2">
        {types.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm flex justify-between">
            <div>
              <p className="font-medium">{t.name}</p>
              <p className="text-xs text-zinc-400">{t.price} {t.currency} · {t.quantity_total} ukupno · {t.quantity_available ?? '—'} dostupno</p>
            </div>
            <span className="text-xs text-zinc-500">{t.is_active ? 'Aktivna' : 'Neaktivna'}</span>
          </div>
        ))}
        {types.length === 0 && !error && <p className="text-zinc-400 text-sm">Unesi Event ID i učitaj.</p>}
      </div>
      <p className="text-xs text-zinc-500 mt-4">Endpoint: GET/POST /organizer/events/{'{id}'}/ticket-types</p>
    </div>
  );
}
