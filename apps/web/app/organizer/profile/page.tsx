'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerProfile() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch('/organizer/organizations').then(setData).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Profile</h1>
      <p className="text-zinc-400 text-sm mb-4">Organizatorski modul – samo vlastiti podaci</p>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {data && <pre className="text-xs text-zinc-400 bg-white/5 rounded-xl p-4 overflow-auto">{JSON.stringify(data, null, 2).slice(0, 800)}</pre>}
    </div>
  );
}
