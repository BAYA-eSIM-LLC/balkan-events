'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerReports() {
  const { activeOrg, loading } = useOrganizer();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    adminFetch(`/organizer/reports/finance?org_id=${activeOrg.id}`).then(setData).catch(e => setError(e.message));
  }, [activeOrg]);

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Financijski izvještaji</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {data && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 rounded-xl p-4"><p className="text-zinc-400">Bruto</p><p className="text-xl font-bold">{data.gross} EUR</p></div>
          <div className="bg-white/5 rounded-xl p-4"><p className="text-zinc-400">Provizija</p><p className="text-xl font-bold">{data.platform_fee} EUR</p></div>
          <div className="bg-white/5 rounded-xl p-4"><p className="text-zinc-400">Neto</p><p className="text-xl font-bold">{data.net} EUR</p></div>
          <div className="bg-white/5 rounded-xl p-4"><p className="text-zinc-400">Raspoloživo</p><p className="text-xl font-bold">{data.available} EUR</p></div>
        </div>
      )}
    </div>
  );
}
