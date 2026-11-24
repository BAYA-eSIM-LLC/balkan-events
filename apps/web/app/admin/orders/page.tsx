'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const statuses = ['', 'pending', 'paid', 'cancelled', 'refunded', 'expired', 'reserved'];

export default function AdminOrders() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  function load(p = page) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(p), page_size: String(pageSize), sort, order });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    adminFetch(`/admin/orders?${params}`)
      .then(d => { setItems(d.items || []); setTotal(d.total || 0); setPage(d.page || p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, [status, sort, order]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Narudžbe</p>
        <h1 className="text-2xl font-semibold mt-1">Narudžbe</h1>
        <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz /admin/orders. Statusi su iz modela.</p>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Blokade: nema izvoza narudžbi. Refund zahtijeva Stripe (nije konfiguriran u TEST).
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)} placeholder="Referenca, ID, kupac, email ili događaj" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          {statuses.map(s => <option key={s} value={s}>{s || 'Svi statusi'}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => load(1)} className="px-3 py-2 rounded-lg bg-white text-black text-sm">Traži</button>
          <button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 rounded-lg border border-white/10 text-sm">Sort {order === 'asc' ? '↑' : '↓'}</button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 text-sm">
            <option value="created_at">Datum</option>
            <option value="id">ID</option>
            <option value="total_amount">Iznos</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}
      {!loading && items.length === 0 && <p className="text-zinc-400 text-sm">Nema narudžbi za odabrane filtere.</p>}

      <div className="space-y-2">
        {items.map(o => (
          <Link key={o.id} href={`/admin/orders/${o.id}`} className="block rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm hover:bg-white/[0.07]">
            <div className="flex justify-between gap-2">
              <p className="font-medium">{o.reference || `#${o.id}`}</p>
              <span className="uppercase text-xs text-zinc-400">{o.status}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{o.buyer_name || o.buyer_email || `Korisnik ${o.user_id}`} · {o.total_amount} {o.currency}</p>
            <p className="text-xs text-zinc-500">ID {o.id} · {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span>Ukupno {total}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 rounded-lg border border-white/10 disabled:opacity-40">Prethodna</button>
          <span className="px-2">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => load(page + 1)} className="px-3 py-1 rounded-lg border border-white/10 disabled:opacity-40">Sljedeća</button>
        </div>
      </div>
    </div>
  );
}
