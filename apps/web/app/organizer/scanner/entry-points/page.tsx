'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function EntryPointsPage() {
  const [eventId, setEventId] = useState('');
  const [name, setName] = useState('');
  const [points, setPoints] = useState<any[]>([]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = async () => {
    const r = await fetch(`${API}/scanner/entry-points?event_id=${eventId}`, { headers });
    if (r.ok) setPoints(await r.json());
  };

  const create = async () => {
    const r = await fetch(`${API}/scanner/entry-points`, { method: 'POST', headers, body: JSON.stringify({ event_id: Number(eventId), name }) });
    if (r.ok) load();
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Entry Points</h1>
      <input className="border p-2 w-full mb-2" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Name (e.g. Main Entrance)" value={name} onChange={e => setName(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={load} className="border px-4 py-2 rounded">Load</button>
        <button onClick={create} className="bg-black text-white px-4 py-2 rounded">Add</button>
      </div>
      <ul className="mt-4 text-sm">{points.map(p => <li key={p.id}>{p.name}</li>)}</ul>
    </div>
  );
}
