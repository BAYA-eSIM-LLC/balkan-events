'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setError('Nisi prijavljen. Admin funkcije zahtijevaju SUPERADMIN/ADMIN ulogu.');
      setLoading(false);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Admin API nije dostupan na produkciji' : `Greška ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Korisnici', value: data?.users ?? '—', note: 'Stvarni broj iz baze' },
    { label: 'Organizacije', value: data?.organizations ?? '—', note: 'Verificirani + pending' },
    { label: 'Događaji', value: data?.events ?? '—', note: 'Svi statusi' },
    { label: 'Narudžbe', value: data?.orders ?? '—', note: 'Plaćene + pending' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">BALKAN EVENTS · BAYA eSIM LLC</p>
      </div>

      {loading && <div className="text-zinc-400">Učitavanje...</div>}

      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-5 mb-6">
          <p className="font-medium">API status</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2 text-zinc-400">Ovo je očekivano dok se puni API ne deploya. UI je spreman za povezivanje.</p>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Brzi pristup</h3>
          <div className="space-y-2 text-sm">
            <a href="/admin/events" className="block text-purple-300 hover:text-white">→ Moderacija događaja</a>
            <a href="/admin/organizations" className="block text-purple-300 hover:text-white">→ Odobrenje organizatora</a>
            <a href="/admin/cms" className="block text-purple-300 hover:text-white">→ CMS – Hero & Homepage</a>
            <a href="/admin/support" className="block text-purple-300 hover:text-white">→ Support tiketi</a>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">Status modula</h3>
          <ul className="text-sm space-y-1 text-zinc-400">
            <li>✓ Dashboard UI</li>
            <li>✓ Navigacija svih modula</li>
            <li>✓ RBAC spreman (SUPERADMIN)</li>
            <li>⏳ Puni API deploy potreban za stvarne podatke</li>
            <li>⏳ CMS backend (hero, bannere) – nova migracija</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
