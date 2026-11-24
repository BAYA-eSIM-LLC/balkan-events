'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const periods = [
  { id: 'today', label: 'Danas' },
  { id: '7d', label: '7 dana' },
  { id: '30d', label: '30 dana' },
  { id: 'all', label: 'Sve' },
];

export default function AdminFinance() {
  const [period, setPeriod] = useState('all');
  const [overview, setOverview] = useState<any>(null);
  const [byOrg, setByOrg] = useState<any[]>([]);
  const [byEvent, setByEvent] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([
      adminFetch(`/admin/finance/overview?period=${period}`),
      adminFetch('/admin/analytics/by-organizer'),
      adminFetch('/admin/analytics/by-event'),
      adminFetch(`/admin/analytics/daily?period=${period === 'all' ? 'all' : period}`),
      adminFetch('/payments/admin'),
      adminFetch('/admin/finance/ledger?page=1&page_size=20'),
    ])
      .then(([ov, orgs, events, days, pays, led]) => {
        setOverview(ov);
        setByOrg(Array.isArray(orgs) ? orgs : []);
        setByEvent(Array.isArray(events) ? events : []);
        setDaily(days?.days || []);
        setPayments(Array.isArray(pays) ? pays : []);
        setLedger(led?.items || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [period]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Financije</p>
        <h1 className="text-2xl font-semibold mt-1">Financije</h1>
        <p className="text-sm text-zinc-400 mt-1">Stvarni agregati iz narudžbi, plaćanja i knjige. Nema izmišljenih iznosa.</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Blokade: nema API-ja za isplate organizatorima. Nema financijskog CSV/PDF izvoza. Refund zahtijeva Stripe (nije u TEST).
      </div>

      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-3 py-1.5 rounded-lg text-sm border ${period === p.id ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-300'}`}>{p.label}</button>
        ))}
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}

      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Bruto (plaćeno)" value={`${overview.gross_paid} EUR`} />
          <Kpi label="Provizija platforme" value={`${overview.platform_fee} EUR`} />
          <Kpi label="Stripe naknade" value={`${overview.stripe_fee} EUR`} />
          <Kpi label="Neto nakon naknada" value={`${overview.net_after_fees} EUR`} />
          <Kpi label="Refundacije (narudžbe)" value={`${overview.refunded_orders_amount} EUR`} />
          <Kpi label="Refundacije (iznos)" value={`${overview.refunds_total} EUR`} />
          <Kpi label="Plaćene narudžbe" value={String(overview.orders_paid)} />
          <Kpi label="Knjiga / Isplate" value={`${overview.ledger_entries} / ${overview.payouts_count}`} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Prihod po organizatoru">
          {byOrg.length === 0 && <Empty />}
          {byOrg.map(o => (
            <Row key={o.organization_id} left={<Link href={`/admin/organizations/${o.organization_id}`} className="hover:underline">{o.name}</Link>} right={`${o.revenue} EUR · ${o.orders} nar.`} />
          ))}
        </Panel>
        <Panel title="Prihod po događaju">
          {byEvent.length === 0 && <Empty />}
          {byEvent.map(e => (
            <Row key={e.event_id} left={<Link href={`/admin/events/${e.event_id}`} className="hover:underline">{e.title}</Link>} right={`${e.revenue} EUR · ${e.orders} nar.`} />
          ))}
        </Panel>
      </div>

      <Panel title="Dnevni promet">
        {daily.length === 0 && <Empty />}
        <div className="space-y-1 text-sm">
          {daily.slice(-14).map(d => (
            <div key={d.date} className="flex justify-between border-b border-white/5 py-1">
              <span>{d.date}</span>
              <span className="text-zinc-400">{d.revenue} EUR · {d.tickets} ul.</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Transakcije (zadnjih 100)">
        {payments.length === 0 && <Empty />}
        {payments.map(p => (
          <Row key={p.id} left={<Link href={`/admin/orders/${p.order_id}`} className="hover:underline">Payment #{p.id} · Order {p.order_id}</Link>} right={`${p.amount} EUR · ${p.status}`} />
        ))}
        {payments.length > 0 && <p className="text-xs text-zinc-500 mt-2">Platform fee i Stripe fee prikazani u detaljima narudžbe.</p>}
      </Panel>

      <Panel title="Knjiga (ledger)">
        {ledger.length === 0 && <Empty />}
        {ledger.map(e => (
          <Row key={e.id} left={<span>{e.entry_type} · {e.description || '—'}</span>} right={`${e.amount} ${e.currency}`} />
        ))}
      </Panel>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: string }) {
  return (
    <div className="flex justify-between gap-2 text-sm py-1 border-b border-white/5">
      <span className="truncate">{left}</span>
      <span className="text-zinc-400 shrink-0">{right}</span>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-zinc-400">Nema podataka.</p>;
}
