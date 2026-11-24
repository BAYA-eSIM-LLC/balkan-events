'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerAnalyticsPage() {
  const { activeOrg, loading } = useOrganizer();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!activeOrg) return;
    adminFetch(`/organizer/reports/events?org_id=${activeOrg.id}`).then(setData).catch(() => setData(null));
  }, [activeOrg]);

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Analitika</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      {data && <pre className="text-xs text-zinc-400 bg-white/5 rounded-xl p-4">{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
