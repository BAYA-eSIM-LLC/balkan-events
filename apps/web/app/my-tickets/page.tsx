'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/payments/my-tickets').then(setTickets).catch(e => setError(e.message));
    adminFetch('/orders/me').then(setOrders).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b1f] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Moje ulaznice</h1>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="space-y-4">
        {tickets.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">Ulaznica #{t.id}</p>
            <p className="text-sm text-zinc-400 font-mono">{t.qr_data}</p>
            <p className="text-xs text-zinc-500 mt-1">{t.is_used ? 'Iskorištena' : 'Valjana'}</p>
          </div>
        ))}
        {tickets.length === 0 && !error && <p className="text-zinc-400 text-sm">Nema izdanih ulaznica.</p>}
      </div>
      <h2 className="text-xl font-bold mt-8 mb-4">Narudžbe</h2>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">{o.reference}</p>
            <p className="text-sm text-zinc-400">{o.status} · {o.total_amount} {o.currency}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
