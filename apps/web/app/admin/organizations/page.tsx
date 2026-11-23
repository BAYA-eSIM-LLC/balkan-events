'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminOrgs() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/organizations/pending')
      .then(d => setOrgs(Array.isArray(d) ? d : d.items || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Organizatori</h1>
      <p className="text-zinc-400 text-sm mb-6">Pending verifikacije</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {!loading && !error && orgs.length === 0 && <p className="text-zinc-400 text-sm">Nema organizacija na čekanju.</p>}
      <div className="space-y-3">
        {orgs.map(o => (
          <div key={o.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{o.name}</p>
              <p className="text-xs text-zinc-400">{o.verification_status || 'PENDING'}</p>
            </div>
            <div className="flex gap-2">
              <button className="text-xs bg-green-600 px-3 py-1.5 rounded-lg">Odobri</button>
              <button className="text-xs bg-red-600/80 px-3 py-1.5 rounded-lg">Odbij</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
