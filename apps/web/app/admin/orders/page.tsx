'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real endpoint – no fake data. If backend is not running the UI shows the error clearly.
    adminFetch('/admin/orders?page=1&page_size=50')
      .then(d => setOrders(d.items || d || []))
      .catch(e => setError(e.message || 'API unavailable'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Narudžbe</h1>
      <p className="text-zinc-400 text-sm mb-6">Stvarni podaci iz API-ja. Bez lažnih redova.</p>

      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 mb-6 text-sm">
          {error}
          <p className="text-xs text-zinc-500 mt-2">Endpoint /admin/orders mora biti aktivan. Nema demo podataka.</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-zinc-400 text-sm">
          Nema narudžbi u bazi.
        </div>
      )}

      {orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400 border-b border-white/10">
                <th className="pb-2">ID</th>
                <th className="pb-2">Referenca</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Iznos</th>
                <th className="pb-2">Korisnik</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-white/5">
                  <td className="py-2">{o.id}</td>
                  <td>{o.reference || '—'}</td>
                  <td>{o.status}</td>
                  <td>{o.total_amount} {o.currency}</td>
                  <td>{o.user_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
