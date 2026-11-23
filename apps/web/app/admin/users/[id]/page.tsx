'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [u, setU] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    adminFetch(`/admin/users/${id}`)
      .then(setU)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function toggle() {
    setBusy(true);
    try {
      await adminFetch(`/admin/users/${id}/active?active=${!u.is_active}`, { method: 'PATCH' });
      setConfirm(false);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-zinc-400 text-sm">Učitavanje profila...</p>;
  if (error) return <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>;
  if (!u) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/users" className="hover:text-white">Korisnici</Link>
        <span>/</span>
        <span>{u.email}</span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{u.full_name || u.email}</h1>
            <p className="text-sm text-zinc-400 mt-1">{u.email}</p>
            <p className="text-xs text-zinc-500 mt-1">ID {u.id} · {u.phone || 'nema telefon'}</p>
          </div>
          <div className="text-sm">
            <p><span className="text-zinc-400">Uloga:</span> <span className="uppercase tracking-wider">{u.role}</span></p>
            <p><span className="text-zinc-400">Status:</span> <span className={u.is_active ? 'text-emerald-400' : 'text-rose-400'}>{u.is_active ? 'Aktivan' : 'Neaktivan'}</span></p>
            <p><span className="text-zinc-400">Registracija:</span> {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</p>
            <p><span className="text-zinc-400">Posljednja aktivnost:</span> {u.last_activity ? new Date(u.last_activity).toLocaleString() : '—'}</p>
          </div>
        </div>
        <button onClick={() => setConfirm(true)} className="mt-4 px-3 py-1.5 rounded-lg bg-white/10 text-sm">
          {u.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Narudžbe</h2>
          {u.orders?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema narudžbi.</p>}
          <div className="mt-3 space-y-2">
            {u.orders?.map((o: any) => (
              <div key={o.id} className="text-sm border-b border-white/5 pb-2">
                <p className="font-medium">{o.reference || `#${o.id}`}</p>
                <p className="text-xs text-zinc-500">{o.status} · {o.total_amount} · {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Ulaznice</h2>
          {u.tickets?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema ulaznica.</p>}
          <div className="mt-3 space-y-2">
            {u.tickets?.map((t: any) => (
              <div key={t.id} className="text-sm border-b border-white/5 pb-2">
                <p className="font-medium">{t.code}</p>
                <p className="text-xs text-zinc-500">{t.is_used ? 'Iskorištena' : 'Važeća'} · narudžba {t.order_id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-5 max-w-sm w-full">
            <h2 className="font-semibold">Potvrda</h2>
            <p className="text-sm text-zinc-300 mt-2">
              {u.is_active ? 'Deaktivirati' : 'Aktivirati'} korisnika {u.email}? Promjena se bilježi u audit logu.
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setConfirm(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-sm">Odustani</button>
              <button onClick={toggle} disabled={busy} className="flex-1 py-2 rounded-lg bg-white text-black text-sm disabled:opacity-50">{busy ? '...' : 'Potvrdi'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
