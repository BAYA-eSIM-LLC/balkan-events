'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function SeatMapBuilderPage() {
  const { events, activeOrg, loading } = useOrganizer();
  const [eventId, setEventId] = useState('');
  const [mapData, setMapData] = useState<any>(null);
  const [name, setName] = useState('Main Hall');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!eventId) { setMapData(null); return; }
    adminFetch(`/seat-maps/event/${eventId}`).then(setMapData).catch(() => setMapData(null));
  }, [eventId]);

  const createMap = async () => {
    if (!eventId || !activeOrg) return;
    try {
      const d = await adminFetch('/seat-maps', { method: 'POST', body: JSON.stringify({ event_id: parseInt(eventId), organization_id: activeOrg.id, name }) });
      setMsg(`Mapa ${d.id} kreirana`);
      adminFetch(`/seat-maps/event/${eventId}`).then(setMapData);
    } catch (e: any) { setMsg(e.message); }
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  const sm = mapData?.seat_map;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mape sjedišta</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm mb-4">
        <option value="">Odaberi događaj</option>
        {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
      </select>
      {eventId && !sm && (
        <div className="flex gap-2 mb-4 max-w-md">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Naziv mape" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button onClick={createMap} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Nova mapa</button>
        </div>
      )}
      {msg && <p className="text-sm text-zinc-300 mb-2">{msg}</p>}
      {sm && (
        <div className="bg-white/5 rounded-xl p-4">
          <p className="font-medium">{sm.name}</p>
          <p className="text-sm text-zinc-400">ID {sm.id} · {sm.sectors?.length || 0} sektora</p>
          {sm.sectors?.map((s: any) => (
            <div key={s.id} className="mt-2 text-sm text-zinc-300">{s.name} · {s.rows?.length || 0} redova</div>
          ))}
        </div>
      )}
      {eventId && !sm && <p className="text-zinc-500 text-sm">Nema mape za ovaj događaj.</p>}
    </div>
  );
}
