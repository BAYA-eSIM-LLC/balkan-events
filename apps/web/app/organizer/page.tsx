'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerDashboard() {
  const { activeOrg, loading } = useOrganizer();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    adminFetch(`/organizer/dashboard?org_id=${activeOrg.id}`).then(setData).catch(e => setError(e.message));
  }, [activeOrg]);

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije. Kreiraj ili se pridruži organizaciji.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-6">{activeOrg.name} {activeOrg.verification_status !== 'VERIFIED' && <span className="text-amber-400">(nije verificirana)</span>}</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Događaji</p><p className="text-2xl font-bold mt-1">{data?.total_events ?? '—'}</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Članovi</p><p className="text-2xl font-bold mt-1">{data?.members ?? '—'}</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Favoriti</p><p className="text-2xl font-bold mt-1">{data?.favorites ?? '—'}</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Statusi</p><p className="text-sm font-bold mt-1">{data?.by_status ? Object.entries(data.by_status).map(([k,v]) => `${k}:${v}`).join(' ') : '—'}</p></div>
      </div>
    </div>
  );
}
