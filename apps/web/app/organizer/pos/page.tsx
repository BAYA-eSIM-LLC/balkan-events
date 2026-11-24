'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerPOS() {
  const { events, activeOrg, loading } = useOrganizer();
  const [eventId, setEventId] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [typeId, setTypeId] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!eventId) { setTypes([]); return; }
    adminFetch(`/organizer/events/${eventId}/ticket-types`).then(setTypes).catch(() => setTypes([]));
  }, [eventId]);

  const sell = async () => {
    if (!typeId) return;
    try {
      const r = await adminFetch('/pos/cash-sale', { method: 'POST', body: JSON.stringify({ ticket_type_id: parseInt(typeId), quantity: 1 }) });
      setMsg(`Prodano: ${r.reference || r.id}`);
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">POS</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="space-y-3 max-w-md">
        <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi događaj</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <select value={typeId} onChange={e => setTypeId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi kategoriju</option>
          {types.map(t => <option key={t.id} value={t.id}>{t.name} · {t.price} {t.currency}</option>)}
        </select>
        <button onClick={sell} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Prodaj (cash)</button>
        {msg && <p className="text-sm text-zinc-300">{msg}</p>}
      </div>
    </div>
  );
}
