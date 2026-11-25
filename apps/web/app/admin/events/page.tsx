'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const statuses = [
  { id: '', label: 'Svi statusi' },
  { id: 'DRAFT', label: 'Nacrt' },
  { id: 'SUBMITTED', label: 'Na čekanju' },
  { id: 'APPROVED', label: 'Odobren' },
  { id: 'PUBLISHED', label: 'Objavljen' },
  { id: 'SUSPENDED', label: 'Deaktiviran' },
  { id: 'CANCELLED', label: 'Otkazan' },
  { id: 'COMPLETED', label: 'Završen' },
];

export default function AdminEvents() {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('start_at');
  const [order, setOrder] = useState('desc');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [create, setCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", organization_id: 1, start_at: "", venue_name: "", category_id: 1 });
  const pageSize = 20;

  function load(p = page) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(p), page_size: String(pageSize), sort, order });
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    adminFetch(`/admin/events?${params}`)
      .then(d => { setItems(d.items || []); setTotal(d.total || 0); setPage(d.page || p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, [status, sort, order]);

  async function act() {
    if (!confirm) return;
    if (confirm.action === 'reject' && !reason.trim()) {
      setError('Obrazloženje je obavezno.');
      return;
    }
    setBusy(true);
    try {
      const qs = reason.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : '';
      await adminFetch(`/admin/events/${confirm.id}/${confirm.action}${qs}`, { method: 'POST' });
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Događaji</p>
        <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold mt-1">Događaji platforme</h1><button onClick={() => setCreate(true)} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm">+ Novi događaj</button></div>
        <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz /admin/events. Status REJECTED ne postoji u modelu.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(1)} placeholder="Naziv, organizator, grad ili ID" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={() => load(1)} className="px-3 py-2 rounded-lg bg-white text-black text-sm">Traži</button>
          <button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 rounded-lg border border-white/10 text-sm">Sort {order === 'asc' ? '↑' : '↓'}</button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 text-sm">
            <option value="start_at">Datum</option>
            <option value="title">Naziv</option>
            <option value="created_at">Kreirano</option>
            <option value="id">ID</option>
          </select>
        </div>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}
      {!loading && items.length === 0 && <p className="text-zinc-400 text-sm">Nema događaja za odabrane filtere.</p>}

      <div className="space-y-2">
        {items.map(e => (
          <div key={e.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <div className="min-w-0 flex gap-3">
              {e.image_url && <img src={e.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />}
              <div>
                <Link href={`/admin/events/${e.id}`} className="font-medium hover:underline">{e.title}</Link>
                <p className="text-xs text-zinc-400 truncate">{e.organization_name || '—'} · {e.city || '—'} · ID {e.id}</p>
                <p className="text-xs text-zinc-500 mt-0.5 uppercase">{e.status} · {e.start_at ? new Date(e.start_at).toLocaleString() : '—'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/events/${e.id}`} className="px-3 py-1.5 rounded-lg border border-white/10 text-xs">Detalji</Link><button onClick={async () => { if(confirm("Obrisati " + e.title + "?")) { await adminFetch("/admin/events/" + e.id, { method: "DELETE" }); load(); } }} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-xs">Obriši</button>
              {e.status === 'SUBMITTED' && <button onClick={() => setConfirm({ ...e, action: 'approve' })} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs">Odobri</button>}
              {e.status === 'APPROVED' && <button onClick={() => setConfirm({ ...e, action: 'publish' })} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs">Objavi</button>}
              {e.status === 'PUBLISHED' && <button onClick={() => setConfirm({ ...e, action: 'suspend' })} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs">Deaktiviraj</button>}
              {e.status === 'SUBMITTED' && <button onClick={() => setConfirm({ ...e, action: 'reject' })} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-xs">Vrati u nacrt</button>}
              {['SUBMITTED', 'APPROVED', 'PUBLISHED', 'SUSPENDED'].includes(e.status) && <button onClick={() => setConfirm({ ...e, action: 'cancel' })} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs">Otkaži</button>}
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

      {create && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-5 max-w-md w-full space-y-3">
            <h3 className="font-semibold">Novi događaj</h3>
            <input value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Naziv događaja" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <select value={newEvent.category_id} onChange={e => setNewEvent({...newEvent, category_id: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
              <option value="1">Koncerti</option>
              <option value="2">Festivali</option>
              <option value="3">Sport</option>
              <option value="4">Teatar</option>
              <option value="5">Kultura</option>
              <option value="6">Noćni život</option>
            </select>
            <input type="datetime-local" value={newEvent.start_at} onChange={e => setNewEvent({...newEvent, start_at: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <input value={newEvent.venue_name} onChange={e => setNewEvent({...newEvent, venue_name: e.target.value})} placeholder="Lokacija" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={() => setCreate(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={async () => { setBusy(true); try { await adminFetch("/admin/events", { method: "POST", body: JSON.stringify({ ...newEvent, start_at: newEvent.start_at + ":00" }) }); setCreate(false); load(); } catch(err: any) { setError(err.message); } finally { setBusy(false); } }} disabled={busy || !newEvent.title} className="flex-1 py-2 rounded-lg bg-emerald-500 text-white text-sm disabled:opacity-50">{busy ? "..." : "Kreiraj"}</button>
            </div>
          </div>
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-5 max-w-sm w-full">
            <h2 className="font-semibold">Potvrda</h2>
            <p className="text-sm text-zinc-300 mt-2">{confirm.action} — {confirm.title}</p>
            {confirm.action === 'reject' && (
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
