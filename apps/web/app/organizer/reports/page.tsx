'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerReports() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/organizer/reports/finance').then(setData).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Financijski izvještaji</h1>
      <p className="text-zinc-400 text-sm mb-4">Samo vlastita organizacija · Finance Viewer ima samo pregled</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {data && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Ukupno</p><p className="text-2xl font-bold">{data.total ?? '—'}</p></div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-xs text-zinc-400">Plaćeno</p><p className="text-2xl font-bold">{data.paid ?? '—'}</p></div>
        </div>
      )}
      <p className="text-xs text-zinc-500 mt-4">Endpoint: GET /organizer/reports/finance (RBAC: Finance Viewer = read-only)</p>
    </div>
  );
}
