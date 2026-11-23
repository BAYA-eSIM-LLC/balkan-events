'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SeatMapBuilderPage() {
  const [eventId, setEventId] = useState('');
  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState('Main Hall');
  const [mapId, setMapId] = useState<number | null>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [preview, setPreview] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const createMap = async () => {
    const r = await fetch(`${API}/seat-maps`, {
      method: 'POST', headers,
      body: JSON.stringify({ event_id: Number(eventId), organization_id: Number(orgId), name }),
    });
    const d = await r.json();
    if (r.ok) { setMapId(d.id); setMsg(`Map ${d.id} created`); }
    else setMsg(d.detail || 'Error');
  };

  const addSector = async (type: string, price: number) => {
    if (!mapId) return;
    const r = await fetch(`${API}/seat-maps/${mapId}/sectors`, {
      method: 'POST', headers,
      body: JSON.stringify({ name: type, sector_type: type, base_price: price, is_numbered: true }),
    });
    const d = await r.json();
    if (r.ok) {
      setSectors(prev => [...prev, { id: d.id, name: type, price, rows: [] }]);
      setMsg(`Sector ${d.id}`);
    } else setMsg(d.detail || 'Error');
  };

  const addRow = async (sectorId: number, label: string, count: number) => {
    const r = await fetch(`${API}/seat-maps/sectors/${sectorId}/rows`, {
      method: 'POST', headers,
      body: JSON.stringify({ label, seats_count: count, start_number: 1 }),
    });
    const d = await r.json();
    setMsg(r.ok ? `Row ${d.id} with ${d.seats_created} seats` : (d.detail || 'Error'));
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Seat Map Builder</h1>
      <div className="space-y-2 mb-6">
        <input className="border p-2 w-full" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Map name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={createMap} className="bg-black text-white px-4 py-2 rounded">Create Map</button>
      </div>
      {mapId && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => addSector('STANDARD', 20)} className="bg-gray-700 text-white px-3 py-2 rounded text-sm">+ Standard</button>
            <button onClick={() => addSector('VIP', 50)} className="bg-yellow-600 text-white px-3 py-2 rounded text-sm">+ VIP</button>
            <button onClick={() => addSector('TRIBUNE', 15)} className="bg-blue-600 text-white px-3 py-2 rounded text-sm">+ Tribune</button>
          </div>
          {sectors.map(s => (
            <div key={s.id} className="border p-3 rounded">
              <div className="font-medium">{s.name} — {s.price} EUR</div>
              <button onClick={() => addRow(s.id, 'A', 10)} className="mt-2 text-sm underline">Add row of 10</button>
            </div>
          ))}
          <button onClick={() => setPreview(!preview)} className="border px-3 py-2 rounded text-sm">
            {preview ? 'Hide' : 'Preview'} map
          </button>
          {preview && <p className="text-sm text-gray-600">Preview: map {mapId} is saved. Open public seats page to see live layout.</p>}
        </div>
      )}
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
