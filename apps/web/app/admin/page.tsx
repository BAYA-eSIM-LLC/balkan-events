'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

type Dash = {
  users: number;
  organizations: number;
  events: number;
  published_events: number;
  pending_verifications: number;
  open_support_tickets: number;
  orders: number;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Dash | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch('/admin/dashboard'),
      adminFetch('/admin/audit?page=1&page_size=6').catch(() => ({ items: [] })),
    ])
      .then(([dash, audit]) => {
        setData(dash);
        setLogs(audit.items || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Korisnici', value: data?.users ?? 0, href: '/admin/users' },
    { label: 'Organizatori', value: data?.organizations ?? 0, href: '/admin/organizations' },
    { label: 'Događaji', value: data?.events ?? 0, href: '/admin/events' },
    { label: 'Objavljeni', value: data?.published_events ?? 0, href: '/admin/events' },
    { label: 'Narudžbe', value: data?.orders ?? 0, href: '/admin/orders' },
    { label: 'Čeka odobrenje', value: data?.pending_verifications ?? 0, href: '/admin/organizations' },
    { label: 'Otvorena podrška', value: data?.open_support_tickets ?? 0, href: '/admin/support' },
  ];
  const max = Math.max(1, ...kpis.map(k => Number(k.value) || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Super Admin</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Pregled poslovanja</h1>
          <p className="text-sm text-zinc-400 mt-1">Stvarni brojevi iz baze. Nema procijenjenih vrijednosti.</p>
        </div>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje stvarnih podataka...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-2xl p-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.slice(0, 4).map(k => (
          <Link key={k.label} href={k.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07]">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">{k.label}</p>
            <p className="text-3xl font-semibold mt-2">{k.value}</p>
            <p className="text-[11px] text-zinc-500 mt-1">Iz baze</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Aktivnost po modulima</h2>
          <p className="text-xs text-zinc-500 mt-1">Brojevi iz /admin/dashboard. Nula znači da zapisa nema.</p>
          <div className="mt-5 space-y-3">
            {kpis.map(k => (
              <div key={k.label}>
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>{k.label}</span>
                  <span>{k.value}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#6d3df5] to-[#d4af77]" style={{ width: `${(Number(k.value) / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Posljednje aktivnosti</h2>
          <p className="text-xs text-zinc-500 mt-1">Iz audit loga</p>
          {logs.length === 0 && <p className="text-sm text-zinc-400 mt-4">Nema audit zapisa. Prikazano kao 0 aktivnosti.</p>}
          <div className="mt-4 space-y-3">
            {logs.map(l => (
              <div key={l.id} className="text-sm border-b border-white/5 pb-2">
                <p className="font-medium">{l.action}</p>
                <p className="text-xs text-zinc-500">{l.created_at || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {kpis.slice(4).map(k => (
          <Link key={k.label} href={k.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">{k.label}</p>
            <p className="text-2xl font-semibold mt-2">{k.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
