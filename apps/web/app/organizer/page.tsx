'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/organizer/dashboard').then(setData).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Organizer Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-6">Pregled vlastite organizacije</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Događaji</p><p className="text-2xl font-bold mt-1">{data?.events ?? '—'}</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Ulaznice</p><p className="text-2xl font-bold mt-1">{data?.tickets_sold ?? '—'}</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Narudžbe</p><p className="text-2xl font-bold mt-1">{data?.orders ?? '—'}</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Prihod</p><p className="text-2xl font-bold mt-1">{data?.revenue ?? '—'}</p></div>
      </div>
    </div>
  );
}
