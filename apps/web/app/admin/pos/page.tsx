'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminPOSPage() {
  const [points, setPoints] = useState<any[]>([]);
  const [registers, setRegisters] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const h = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      fetch(`${API}/admin/pos/sales-points`, { headers: h }).then(r => r.json()),
      fetch(`${API}/admin/pos/registers`, { headers: h }).then(r => r.json()),
    ]).then(([p, r]) => { setPoints(p || []); setRegisters(r || []); });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">POS Overview</h1>
      <h2 className="font-semibold mb-2">Sales Points</h2>
      <ul className="mb-6 text-sm">
        {points.map(p => <li key={p.id}>{p.name} (org {p.organization_id}) – {p.is_active ? 'active' : 'inactive'}</li>)}
        {points.length === 0 && <li className="text-gray-500">None</li>}
      </ul>
      <h2 className="font-semibold mb-2">Registers</h2>
      <ul className="text-sm">
        {registers.map(r => <li key={r.id}>#{r.id} point {r.sales_point_id} – {r.status}</li>)}
        {registers.length === 0 && <li className="text-gray-500">None</li>}
      </ul>
    </div>
  );
}
