'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/sponsors`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(setSponsors);
  };

  useEffect(load, []);

  const create = async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/admin/sponsors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ name, level: 'GOLD' }),
    });
    const d = await r.json();
    if (r.ok) { setMsg(`Created ${d.id}`); load(); }
    else setMsg(d.detail || 'Error');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sponsors</h1>
      <div className="flex gap-2 mb-4">
        <input className="border p-2" placeholder="Sponsor name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={create} className="bg-black text-white px-4 py-2 rounded">Add</button>
      </div>
      <ul className="text-sm space-y-1">
        {sponsors.map(s => <li key={s.id}>{s.name} — {s.level} ({s.status})</li>)}
        {sponsors.length === 0 && <li className="text-gray-500">None</li>}
      </ul>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
