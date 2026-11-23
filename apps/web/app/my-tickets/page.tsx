'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function MyTickets() {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/orders/me').then(setOrders).catch(e => setError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b1f] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Moje narudžbe i ulaznice</h1>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">{o.reference}</p>
            <p className="text-sm text-zinc-400">{o.status} · {o.total_amount} {o.currency}</p>
            <p className="text-xs text-zinc-500 mt-1">Rezervirano do: {o.reserved_until || '—'}</p>
          </div>
        ))}
        {orders.length === 0 && !error && <p className="text-zinc-400 text-sm">Nema narudžbi.</p>}
      </div>
    </div>
  );
}
