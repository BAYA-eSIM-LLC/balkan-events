'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrganizerSponsorsPage() {
  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState('');
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const load = async () => {
    const r = await fetch(`${API}/sponsors?organization_id=${orgId}`, { headers });
    const d = await r.json();
    if (r.ok) setSponsors(d);
    else setMsg(d.detail || 'Error');
  };

  const create = async () => {
    const r = await fetch(`${API}/sponsors`, {
      method: 'POST', headers,
      body: JSON.stringify({ organization_id: Number(orgId), name, level: 'PARTNER' }),
    });
    const d = await r.json();
    if (r.ok) { setMsg(`Created ${d.id}`); load(); }
    else setMsg(d.detail || 'Error');
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">My Sponsors</h1>
      <div className="space-y-2 mb-4">
        <input className="border p-2 w-full" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Sponsor name" value={name} onChange={e => setName(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={load} className="border px-4 py-2 rounded">Load</button>
          <button onClick={create} className="bg-black text-white px-4 py-2 rounded">Add</button>
        </div>
      </div>
      <ul className="text-sm">
        {sponsors.map(s => <li key={s.id}>{s.name} — {s.level}</li>)}
      </ul>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
