'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrganizerAnalyticsPage() {
  const [orgId, setOrgId] = useState('');
  const [data, setData] = useState<any>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/analytics/organizer/${orgId}?period=this_month`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const d = await r.json();
    if (r.ok) setData(d);
    else setMsg(d.detail || 'Error');
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Organizer Analytics</h1>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 flex-1" placeholder="Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
        <button onClick={load} className="bg-black text-white px-4 py-2 rounded">Load</button>
      </div>
      {data && (
        <div className="space-y-2 text-sm">
          <div>Revenue: {data.revenue}</div>
          <div>Web: {data.web_revenue}</div>
          <div>POS: {data.pos_revenue}</div>
          <div>Orders: {data.orders}</div>
          <div>Tickets: {data.tickets} (used {data.tickets_used})</div>
        </div>
      )}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
