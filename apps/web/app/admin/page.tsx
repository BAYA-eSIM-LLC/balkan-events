'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const filters = [
  { id: 'today', label: 'Danas' },
  { id: '7d', label: '7 dana' },
  { id: '30d', label: '30 dana' },
  { id: 'all', label: 'Sve vrijeme' },
];

const overviewPeriod: Record<string, string> = {
  today: 'today',
  '7d': 'this_week',
  '30d': 'this_month',
  all: 'all',
};

export default function AdminDashboard() {
  const [period, setPeriod] = useState('7d');
  const [dash, setDash] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [daily, setDaily] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminFetch('/admin/dashboard'),
      adminFetch(`/admin/analytics/overview?period=${overviewPeriod[period]}`).catch(() => null),
      adminFetch(`/admin/analytics/daily?period=${period}`).catch(() => ({ days: [] })),
      adminFetch('/admin/analytics/by-event').catch(() => []),
      adminFetch('/admin/organizations/pending').catch(() => []),
      adminFetch('/admin/audit?page=1&page_size=8').catch(() => ({ items: [] })),
    ])
      .then(([d, o, day, ev, pend, audit]) => {
        setDash(d);
        setOverview(o);
        setDaily(day.days || []);
        setEvents(Array.isArray(ev) ? ev.slice(0, 5) : []);
        setPending(Array.isArray(pend) ? pend.slice(0, 5) : []);
        setLogs(audit.items || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  const kpis = [
    { label: 'Korisnici', value: dash?.users ?? 0, href: '/admin/users' },
    { label: 'Organizatori', value: dash?.organizations ?? 0, href: '/admin/organizations' },
    { label: 'Događaji', value: dash?.events ?? 0, href: '/admin/events' },
    { label: 'Narudžbe', value: overview?.orders_total ?? dash?.orders ?? 0, href: '/admin/orders' },
    { label: 'Ulaznice', value: overview?.tickets_issued ?? 0, href: '/admin/tickets' },
    { label: 'Prihod', value: overview?.gross_revenue ?? 0, href: '/admin/finance' },
    { label: 'Čeka odobrenje', value: dash?.pending_verifications ?? 0, href: '/admin/organizations' },
    { label: 'Podrška', value: dash?.open_support_tickets ?? 0, href: '/admin/support' },
  ];
  const maxTickets = Math.max(1, ...daily.map(d => Number(d.tickets) || 0));
  const maxRevenue = Math.max(1, ...daily.map(d => Number(d.revenue) || 0));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Super Admin</p>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-1">Pregled poslovanja</h1>
          <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz API-ja. Nema izmišljenih brojki.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setPeriod(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs border ${period === f.id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje stvarnih podataka...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-2xl p-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <Link key={k.label} href={k.href} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07]">
            <p className="text-[11px] uppercase tracking-wider text-zinc-400">{k.label}</p>
            <p className="text-2xl sm:text-3xl font-semibold mt-2">{k.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Prodaja ulaznica i prihod po danima</h2>
        <p className="text-xs text-zinc-500 mt-1">Iz /admin/analytics/daily. Prazan graf znači da nema prodaje.</p>
        {daily.length === 0 && <p className="text-sm text-zinc-400 mt-4">Nema dnevnih zapisa za odabrani period.</p>}
        {daily.length > 0 && (
          <div className="mt-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(daily.length, 30)}, minmax(0, 1fr))` }}>
            {daily.map(d => (
              <div key={d.date} className="flex flex-col items-center gap-1 min-w-0">
                <div className="h-24 w-full flex items-end gap-0.5">
                  <div className="flex-1 bg-[#6d3df5] rounded-t" style={{ height: `${(Number(d.tickets) / maxTickets) * 100}%` }} title={`${d.tickets} ulaznica`} />
                  <div className="flex-1 bg-[#d4af77] rounded-t" style={{ height: `${(Number(d.revenue) / maxRevenue) * 100}%` }} title={`${d.revenue} prihod`} />
                </div>
                <span className="text-[9px] text-zinc-500 truncate w-full text-center">{String(d.date).slice(5)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-4 text-xs text-zinc-400 mt-3">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#6d3df5]" /> Ulaznice</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#d4af77]" /> Prihod</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Posljednje aktivnosti</h2>
          <p className="text-xs text-zinc-500 mt-1">Iz /admin/audit</p>
          {logs.length === 0 && <p className="text-sm text-zinc-400 mt-4">Nema administratorskih aktivnosti.</p>}
          <div className="mt-4 space-y-3">
            {logs.map(l => (
              <div key={l.id} className="text-sm border-b border-white/5 pb-2">
                <p className="font-medium">{l.action}</p>
                <p className="text-xs text-zinc-500">{l.created_at || '—'} · korisnik {l.user_id}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Najprodavaniji događaji</h2>
          <p className="text-xs text-zinc-500 mt-1">Iz /admin/analytics/by-event</p>
          {events.length === 0 && <p className="text-sm text-zinc-400 mt-4">Nema prodanih događaja.</p>}
          <div className="mt-4 space-y-3">
            {events.map(e => (
              <Link key={e.event_id} href="/admin/events" className="block text-sm border-b border-white/5 pb-2">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-zinc-500">{e.orders} narudžbi · {e.revenue}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Čekaju odobrenje</h2>
          <p className="text-xs text-zinc-500 mt-1">Iz /admin/organizations/pending</p>
          {pending.length === 0 && <p className="text-sm text-zinc-400 mt-4">Nema organizatora na odobrenju.</p>}
          <div className="mt-4 space-y-3">
            {pending.map(o => (
              <Link key={o.id} href="/admin/organizations" className="block text-sm border-b border-white/5 pb-2">
                <p className="font-medium">{o.name}</p>
                <p className="text-xs text-zinc-500">{o.verification_status}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
