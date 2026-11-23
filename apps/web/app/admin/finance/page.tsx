'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminFinance() {
  const [payments, setPayments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/payments/admin').then(setPayments).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Financije</h1>
      <p className="text-zinc-400 text-sm mb-6">Sve transakcije (SUPERADMIN / ADMIN / FINANCE_ADMIN)</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="space-y-3">
        {payments.map(p => (
          <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">Payment #{p.id} – Order {p.order_id}</p>
            <p className="text-sm text-zinc-400">Bruto: {p.amount} EUR · Status: {p.status}</p>
            <p className="text-xs text-zinc-500">Platform fee: {p.platform_fee ?? '—'} · Stripe fee: {p.stripe_fee ?? 'nije poznata'}</p>
          </div>
        ))}
        {payments.length === 0 && !error && <p className="text-zinc-400 text-sm">Nema transakcija.</p>}
      </div>
    </div>
  );
}
