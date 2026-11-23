'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SeatMapBuilderPage() {
  const [eventId, setEventId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState('Main Hall');
  const [mapId, setMapId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const createMap = async () => {
    const r = await fetch(`${API}/seat-maps`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event_id: Number(eventId), organization_id: Number(orgId), name }),
    });
    const d = await r.json();
    if (r.ok) { setMapId(d.id); setMsg(`Map created: ${d.id}`); }
    else setMsg(d.detail || 'Error');
  };

  const addSector = async () => {
    if (!mapId) return;
    const r = await fetch(`${API}/seat-maps/${mapId}/sectors`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'VIP', sector_type: 'VIP', base_price: 50, is_numbered: true }),
    });
    const d = await r.json();
    setMsg(r.ok ? `Sector ${d.id}` : (d.detail || 'Error'));
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Seat Map Builder</h1>
      <div className="space-y-2 mb-4">
        <input className="border p-2 w-full" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Map name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={createMap} className="bg-black text-white px-4 py-2 rounded">Create Map</button>
      </div>
      {mapId && (
        <button onClick={addSector} className="bg-gray-800 text-white px-4 py-2 rounded">Add VIP Sector</button>
      )}
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
