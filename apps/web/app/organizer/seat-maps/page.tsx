'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function SeatMapBuilderPage() {
  const { events, activeOrg, loading } = useOrganizer();
  const [eventId, setEventId] = useState('');
  const [maps, setMaps] = useState<any[]>([]);
  const [mapId, setMapId] = useState<number | null>(null);
  const [name, setName] = useState('Main Hall');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!eventId) { setMaps([]); return; }
    adminFetch(`/seat-maps?event_id=${eventId}`).then(setMaps).catch(() => setMaps([]));
  }, [eventId]);

  const createMap = async () => {
    if (!eventId || !activeOrg) return;
    try {
      const d = await adminFetch('/seat-maps', { method: 'POST', body: JSON.stringify({ event_id: parseInt(eventId), organization_id: activeOrg.id, name }) });
      setMsg(`Mapa ${d.id} kreirana`);
      setMaps([...maps, d]);
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mape sjedišta</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-4">
        <option value="">Odaberi događaj</option>
        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
      </select>
      {eventId && (
        <div className="flex gap-2 mb-4 max-w-md">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Naziv mape" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button onClick={createMap} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Nova mapa</button>
        </div>
      )}
      {msg && <p className="text-sm text-zinc-300 mb-2">{msg}</p>}
      <div className="space-y-2">
        {maps.map((m: any) => (
          <div key={m.id} className="bg-white/5 rounded-lg p-3 text-sm">{m.name} · ID {m.id}</div>
        ))}
        {maps.length === 0 && eventId && <p className="text-zinc-500 text-sm">Nema mapa za ovaj događaj.</p>}
      </div>
    </div>
  );
}
