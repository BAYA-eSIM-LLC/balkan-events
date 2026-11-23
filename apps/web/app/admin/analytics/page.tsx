'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState('this_month');
  const [byEvent, setByEvent] = useState<any[]>([]);

  const load = (p: string) => {
    const token = localStorage.getItem('token');
    const h: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}/admin/analytics/overview?period=${p}`, { headers: h })
      .then(r => r.json())
      .then(setData);
    fetch(`${API}/admin/analytics/by-event`, { headers: h })
      .then(r => r.json())
      .then(setByEvent);
  };

  useEffect(() => { load(period); }, [period]);

  if (!data) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <select className="border p-2 mb-4" value={period} onChange={e => setPeriod(e.target.value)}>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="this_week">This week</option>
        <option value="last_week">Last week</option>
        <option value="this_month">This month</option>
        <option value="last_month">Last month</option>
        <option value="this_year">This year</option>
      </select>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border p-4 rounded"><div className="text-sm text-gray-500">Gross</div><div className="text-xl font-bold">{data.gross_revenue}</div></div>
        <div className="border p-4 rounded"><div className="text-sm text-gray-500">Orders</div><div className="text-xl font-bold">{data.orders_paid}</div></div>
        <div className="border p-4 rounded"><div className="text-sm text-gray-500">Web</div><div className="text-xl font-bold">{data.web_revenue}</div></div>
        <div className="border p-4 rounded"><div className="text-sm text-gray-500">POS</div><div className="text-xl font-bold">{data.pos_revenue}</div></div>
      </div>
      <h2 className="font-semibold mb-2">Top events</h2>
      <ul className="text-sm">
        {byEvent.map(e => <li key={e.event_id}>{e.title} — {e.revenue}</li>)}
        {byEvent.length === 0 && <li className="text-gray-500">No data</li>}
      </ul>
    </div>
  );
}
