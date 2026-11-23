'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function POSPage() {
  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState('Main Box Office');
  const [pointId, setPointId] = useState<number | null>(null);
  const [registerId, setRegisterId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  const createPoint = async () => {
    const r = await fetch(`${API}/pos/sales-points`, {
      method: 'POST', headers,
      body: JSON.stringify({ organization_id: Number(orgId), name }),
    });
    const d = await r.json();
    if (r.ok) { setPointId(d.id); setMsg(`Point ${d.id}`); }
    else setMsg(d.detail || 'Error');
  };

  const openRegister = async () => {
    if (!pointId) return;
    const r = await fetch(`${API}/pos/registers/open`, {
      method: 'POST', headers,
      body: JSON.stringify({ sales_point_id: pointId, opening_balance: 100 }),
    });
    const d = await r.json();
    if (r.ok) { setRegisterId(d.id); setMsg(`Register ${d.id} open`); }
    else setMsg(d.detail || 'Error');
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">POS – Sales Points</h1>
      <div className="space-y-2 mb-4">
        <input className="border p-2 w-full" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Point name" value={name} onChange={e => setName(e.target.value)} />
        <button onClick={createPoint} className="bg-black text-white px-4 py-2 rounded">Create Sales Point</button>
      </div>
      {pointId && (
        <button onClick={openRegister} className="bg-gray-800 text-white px-4 py-2 rounded">Open Register</button>
      )}
      {registerId && <p className="mt-4 text-sm">Register {registerId} is open. Use API to sell.</p>}
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
