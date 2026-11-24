'use client';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerEvents() {
  const { events, activeOrg, loading } = useOrganizer();

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Događaji</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="font-medium">{e.title}</p>
            <p className="text-sm text-zinc-400">{e.status} · {e.start_at ? new Date(e.start_at).toLocaleDateString('bs-BA') : '—'}</p>
          </div>
        ))}
        {events.length === 0 && <p className="text-zinc-400 text-sm">Nema događaja.</p>}
      </div>
    </div>
  );
}
