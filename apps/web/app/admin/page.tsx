'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/dashboard')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Korisnici', value: data?.users ?? '—', note: 'Stvarni broj' },
    { label: 'Organizacije', value: data?.organizations ?? '—', note: 'Sve' },
    { label: 'Događaji', value: data?.events ?? '—', note: 'Svi statusi' },
    { label: 'Narudžbe', value: data?.orders ?? '—', note: 'Ukupno' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">BALKAN EVENTS · BAYA eSIM LLC</p>
      </div>

      {loading && <p className="text-zinc-400">Učitavanje stvarnih podataka...</p>}

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 mb-6 text-sm">
          <p className="font-medium">API status</p>
          <p className="mt-1">{error}</p>
          <p className="text-xs text-zinc-500 mt-2">Endpointi postoje u kodu. Aktivacija zahtijeva deploy punog API-ja.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{c.note}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-semibold mb-2">Brzi linkovi</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="/admin/events" className="text-purple-300 hover:text-white">Moderacija događaja</a>
          <a href="/admin/organizations" className="text-purple-300 hover:text-white">Organizatori</a>
          <a href="/admin/users" className="text-purple-300 hover:text-white">Korisnici</a>
          <a href="/admin/support" className="text-purple-300 hover:text-white">Podrška</a>
          <a href="/admin/cms" className="text-purple-300 hover:text-white">CMS</a>
        </div>
      </div>
    </div>
  );
}
