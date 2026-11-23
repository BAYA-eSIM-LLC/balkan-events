'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const roles = ['', 'user', 'organizer', 'admin', 'superadmin', 'event_moderator', 'organizer_reviewer', 'finance_admin', 'support_admin', 'security_admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const pageSize = 20;

  function load(p = page) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(p),
      page_size: String(pageSize),
      sort,
      order,
    });
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    if (active) params.set('active', active === 'true' ? 'true' : 'false');
    if (dateFrom) params.set('date_from', dateFrom);
    if (dateTo) params.set('date_to', dateTo);
    adminFetch(`/admin/users?${params}`)
      .then(d => { setUsers(d.items || []); setTotal(d.total || 0); setPage(d.page || p); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(1); }, [role, active, sort, order]);

  async function doToggle() {
    if (!confirm) return;
    setBusy(true);
    try {
      await adminFetch(`/admin/users/${confirm.id}/active?active=${!confirm.is_active}`, { method: 'PATCH' });
      setConfirm(null);
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
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af77]">Korisnici</p>
        <h1 className="text-2xl font-semibold mt-1">Korisnici platforme</h1>
        <p className="text-sm text-zinc-400 mt-1">Stvarni podaci iz /admin/users. Nema demo podataka.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load(1)}
          placeholder="Ime, email ili ID"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        />
        <select value={role} onChange={e => setRole(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Sve uloge</option>
          {roles.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={active} onChange={e => setActive(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Svi statusi</option>
          <option value="true">Aktivni</option>
          <option value="false">Neaktivni</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => load(1)} className="px-3 py-1.5 rounded-lg bg-white text-black">Traži</button>
        <button onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')} className="px-3 py-1.5 rounded-lg border border-white/10">
          Sort: {sort} {order === 'asc' ? '↑' : '↓'}
        </button>
        <select value={sort} onChange={e => setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5">
          <option value="created_at">Registracija</option>
          <option value="email">Email</option>
          <option value="id">ID</option>
          <option value="role">Uloga</option>
        </select>
      </div>

      {loading && <p className="text-zinc-400 text-sm">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}
      {!loading && users.length === 0 && <p className="text-zinc-400 text-sm">Nema korisnika za odabrane filtere.</p>}

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
            <div className="min-w-0">
              <Link href={`/admin/users/${u.id}`} className="font-medium hover:underline">{u.full_name || u.email}</Link>
              <p className="text-xs text-zinc-400 truncate">{u.email} · ID {u.id}</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                <span className="uppercase tracking-wider">{u.role}</span>
                {' · '}
                <span className={u.is_active ? 'text-emerald-400' : 'text-rose-400'}>{u.is_active ? 'Aktivan' : 'Neaktivan'}</span>
                {' · '}
                {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/users/${u.id}`} className="px-3 py-1.5 rounded-lg border border-white/10 text-xs">Profil</Link>
              <button
                onClick={() => setConfirm(u)}
                className="px-3 py-1.5 rounded-lg bg-white/10 text-xs"
              >
                {u.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
              </button>
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
            <p className="text-sm text-zinc-300 mt-2">
              {confirm.is_active ? 'Deaktivirati' : 'Aktivirati'} korisnika {confirm.email}?
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setConfirm(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={doToggle} disabled={busy} className="flex-1 py-2 rounded-lg bg-white text-black text-sm disabled:opacity-50">
                {busy ? '...' : 'Potvrdi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
