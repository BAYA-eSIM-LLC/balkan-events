'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerOrders() {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/payments/organizer').then(setData).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Moje transakcije</h1>
      <p className="text-zinc-400 text-sm mb-4">Samo vlastiti događaji. Obračun ≠ stvarna isplata.</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      <div className="space-y-3">
        {data.map(e => (
          <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">{e.type}</p>
            <p className="text-sm text-zinc-400">{e.amount} EUR – {e.description}</p>
          </div>
        ))}
        {data.length === 0 && !error && <p className="text-zinc-400 text-sm">Nema stavki.</p>}
      </div>
    </div>
  );
}
