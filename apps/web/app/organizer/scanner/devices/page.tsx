'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ScannerDevicesPage() {
  const [orgId, setOrgId] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');

  const register = async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/scanner/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ name, organization_id: Number(orgId) }),
    });
    const d = await r.json();
    setMsg(r.ok ? `Device ${d.id} registered. Token shown once.` : (d.detail || 'Error'));
  };

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Scanner Devices</h1>
      <input className="border p-2 w-full mb-2" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Device name" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={register} className="bg-black text-white px-4 py-2 rounded">Register</button>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
