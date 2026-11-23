'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const statuses = [
  { id: '', label: 'Svi statusi' },
  { id: 'pending', label: 'Na čekanju' },
  { id: 'VERIFIED', label: 'Odobreni' },
  { id: 'REJECTED', label: 'Odbijeni' },
  { id: 'SUSPENDED', label: 'Suspendirani' },
];

export default function AdminOrgsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const pageSize = 20;

  function load(p = page) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(p), page_size: String(pageSize), sort, order });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    adminFetch(`/admin/organizations?${params}`)
      .then(d => { setItems(d.items || []); setTotal(d.total || 0); setPage(d.page || p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, [status, sort, order]);

  async function act() {
    if (!confirm) return;
    if ((confirm.action === 'reject' || confirm.action === 'suspend') && !reason.trim()) {
      setError('Obrazloženje je obavezno.');
      return;
    }
    setBusy(true);
    try {
      const path = `/admin/organizations/${confirm.id}/${confirm.action}`;
      const qs = reason.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : '';
      await adminFetch(`${path}${qs}`, { method: 'POST' });
      setConfirm(null);
      setReason('');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Organizatori</p>
        <h1 className="text-2xl font-semibold mt-1">Organizatori i organizacije</h1>
        <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz /admin/organizations. Nema demo podataka.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)} placeholder="Naziv, email ili ID" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => load(1)} className="px-3 py-2 rounded-lg bg-white text-black text-sm">Traži</button>
          <button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 rounded-lg border border-white/10 text-sm">Sort {order === 'asc' ? '↑' : '↓'}</button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 text-sm">
            <option value="created_at">Datum</option>
            <option value="name">Naziv</option>
            <option value="id">ID</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}
      {!loading && items.length === 0 && <p className="text-zinc-400 text-sm">Nema organizacija za odabrane filtere.</p>}

      <div className="space-y-2">
        {items.map(o => (
          <div key={o.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <div className="min-w-0">
              <Link href={`/admin/organizations/${o.id}`} className="font-medium hover:underline">{o.name}</Link>
              <p className="text-xs text-zinc-400 truncate">{o.email || 'nema email'} · ID {o.id}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                <span className="uppercase tracking-wider">{o.verification_status}</span>
                {' · '}
                <span className={o.is_active ? 'text-emerald-400' : 'text-rose-400'}>{o.is_active ? 'Aktivna' : 'Neaktivna'}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/organizations/${o.id}`} className="px-3 py-1.5 rounded-lg border border-white/10 text-xs">Profil</Link>
              {o.verification_status !== 'VERIFIED' && (
                <button onClick={() => setConfirm({ ...o, action: 'approve' })} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs">Odobri</button>
              )}
              {o.verification_status !== 'REJECTED' && (
                <button onClick={() => setConfirm({ ...o, action: 'reject' })} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-xs">Odbij</button>
              )}
              {o.is_active ? (
                <button onClick={() => setConfirm({ ...o, action: 'suspend' })} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs">Suspendiraj</button>
              ) : (
                <button onClick={() => setConfirm({ ...o, action: 'activate' })} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs">Aktiviraj</button>
              )}
            </div>
          </div>
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

      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-5 max-w-sm w-full">
            <h2 className="font-semibold">Potvrda</h2>
            <p className="text-sm text-zinc-300 mt-2">{confirm.action} — {confirm.name}</p>
            {(confirm.action === 'reject' || confirm.action === 'suspend') && (
              <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Obavezno obrazloženje" className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm" rows={3} />
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setConfirm(null); setReason(''); }} className="flex-1 py-2 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={act} disabled={busy} className="flex-1 py-2 rounded-lg bg-white text-black text-sm disabled:opacity-50">{busy ? '...' : 'Potvrdi'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
