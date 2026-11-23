'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminSponsorAnalyticsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API}/admin/sponsors/analytics`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sponsor Analytics</h1>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="border p-4 rounded"><div className="text-gray-500">Active</div><div className="text-xl">{data.active_sponsors}</div></div>
        <div className="border p-4 rounded"><div className="text-gray-500">Agreed value</div><div className="text-xl">{data.contract_value_agreed}</div></div>
        <div className="border p-4 rounded"><div className="text-gray-500">Collected</div><div className="text-xl">{data.collected_revenue}</div></div>
        <div className="border p-4 rounded"><div className="text-gray-500">Clicks</div><div className="text-xl">{data.clicks}</div></div>
      </div>
      <p className="mt-4 text-xs text-gray-500">{data.note}</p>
    </div>
  );
}
