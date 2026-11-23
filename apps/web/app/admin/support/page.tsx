'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/support/tickets?page=1&page_size=20')
      .then(d => setTickets(d.items || d || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Podrška</h1>
      <p className="text-zinc-400 text-sm mb-6">Support tiketi</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {!loading && !error && tickets.length === 0 && <p className="text-zinc-400 text-sm">Nema otvorenih tiketa.</p>}
      <div className="space-y-2">
        {tickets.map(t => (
          <div key={t.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm">
            <p className="font-medium">{t.subject}</p>
            <p className="text-xs text-zinc-400">{t.status} · {t.priority}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
