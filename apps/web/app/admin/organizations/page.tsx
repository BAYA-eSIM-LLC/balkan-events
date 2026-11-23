'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminOrgsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    Promise.all([
      adminFetch('/admin/organizations').catch(() => []),
      adminFetch('/admin/organizations/pending').catch(() => []),
    ]).then(([all, pend]) => {
      setOrgs(Array.isArray(all) ? all : all.items || []);
      setPending(Array.isArray(pend) ? pend : pend.items || []);
    }).catch(e => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function approve(id: number) {
    setError(null);
    try {
      await adminFetch(`/admin/organizations/${id}/approve`, { method: 'POST' });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Organizacije</h1>
      <p className="text-zinc-400 text-sm mb-6">Stvarni podaci. Nema demo podataka.</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      <h2 className="font-semibold mb-2">Na odobrenju</h2>
      <div className="space-y-2 mb-6">
        {pending.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between text-sm">
            <span>{o.name}</span>
            <button onClick={() => approve(o.id)} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200">Odobri</button>
          </div>
        ))}
        {!loading && pending.length === 0 && <p className="text-zinc-500 text-sm">Nema organizacija na odobrenju.</p>}
      </div>
      <h2 className="font-semibold mb-2">Sve</h2>
      <div className="space-y-2">
        {orgs.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm">
            {o.name} — {o.is_active ? 'aktivna' : 'suspendirana'}
          </div>
        ))}
        {!loading && orgs.length === 0 && <p className="text-zinc-500 text-sm">Nema organizacija.</p>}
      </div>
    </div>
  );
}
