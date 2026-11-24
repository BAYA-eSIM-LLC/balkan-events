'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function MyTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setNeedLogin(true);
      setLoading(false);
      return;
    }
    Promise.all([
      adminFetch('/payments/my-tickets').catch(e => { throw e; }),
      adminFetch('/orders/me').catch(() => []),
    ])
      .then(([t, o]) => {
        setTickets(t);
        setOrders(o);
        setLoading(false);
      })
      .catch(e => {
        const msg = e.message || '';
        if (msg.includes('401') || msg.includes('Invalid token') || msg.includes('Not authenticated')) {
          localStorage.removeItem('token');
          setNeedLogin(true);
        } else {
          setError(msg);
        }
        setLoading(false);
      });
  }, []);

  if (needLogin) {
    return (
      <div className="min-h-screen bg-[#0b0b1f] text-white p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Moje ulaznice</h1>
          <p className="text-zinc-400 mb-6">Sesija je istekla ili niste prijavljeni. Prijavite se da vidite svoje ulaznice.</p>
          <Link href="/login?next=/my-tickets" className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-semibold">
            Prijavi se
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b1f] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Moje ulaznice</h1>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="space-y-4">
        {tickets.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">Ulaznica #{t.id}</p>
            <p className="text-sm text-zinc-400 font-mono break-all">{t.qr_data}</p>
            <p className="text-xs text-zinc-500 mt-1">{t.is_used ? 'Iskorištena' : 'Valjana'}</p>
          </div>
        ))}
        {tickets.length === 0 && !error && !loading && <p className="text-zinc-400 text-sm">Nema izdanih ulaznica.</p>}
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
