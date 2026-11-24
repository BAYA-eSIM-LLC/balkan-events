'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerSponsorsPage() {
  const { activeOrg, loading } = useOrganizer();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    if (!activeOrg) return;
    adminFetch(`/organizer/sponsors?org_id=${activeOrg.id}`).then(setSponsors).catch(() => setSponsors([]));
  }, [activeOrg]);

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sponzori</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="space-y-2">
        {sponsors.map((s: any) => (
          <div key={s.id} className="bg-white/5 rounded-lg p-3 text-sm">{s.name}</div>
        ))}
        {sponsors.length === 0 && <p className="text-zinc-500 text-sm">Nema sponzora.</p>}
      </div>
    </div>
  );
}
