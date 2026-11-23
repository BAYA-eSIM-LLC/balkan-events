'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function OrgDetail() {
  const { id } = useParams<{ id: string }>();
  const [o, setO] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    adminFetch(`/admin/organizations/${id}`)
      .then(setO)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function act() {
    if (!confirm) return;
    if ((confirm === 'reject' || confirm === 'suspend') && !reason.trim()) {
      setError('Obrazloženje je obavezno.');
      return;
    }
    setBusy(true);
    try {
      const qs = reason.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : '';
      await adminFetch(`/admin/organizations/${id}/${confirm}${qs}`, { method: 'POST' });
      setConfirm(null);
      setReason('');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-zinc-400 text-sm">Učitavanje profila...</p>;
  if (error && !o) return <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>;
  if (!o) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/organizations" className="hover:text-white">Organizatori</Link>
        <span>/</span>
        <span>{o.name}</span>
      </div>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{o.name}</h1>
            <p className="text-sm text-zinc-400 mt-1">{o.email || 'nema email'} · {o.phone || 'nema telefon'}</p>
            <p className="text-xs text-zinc-500 mt-1">ID {o.id} · {o.org_type} · {o.legal_form || 'nema pravni oblik'}</p>
          </div>
          <div className="text-sm">
            <p><span className="text-zinc-400">Status:</span> <span className="uppercase">{o.verification_status}</span></p>
            <p><span className="text-zinc-400">Aktivna:</span> <span className={o.is_active ? 'text-emerald-400' : 'text-rose-400'}>{o.is_active ? 'Da' : 'Ne'}</span></p>
            <p><span className="text-zinc-400">Kontakt:</span> {o.contact_person || '—'}</p>
            <p><span className="text-zinc-400">Adresa:</span> {o.address || '—'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {o.verification_status !== 'VERIFIED' && <button onClick={() => setConfirm('approve')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-sm">Odobri</button>}
          {o.verification_status !== 'REJECTED' && <button onClick={() => setConfirm('reject')} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-sm">Odbij</button>}
          {o.is_active ? (
            <button onClick={() => setConfirm('suspend')} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">Suspendiraj</button>
          ) : (
            <button onClick={() => setConfirm('activate')} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">Aktiviraj</button>
          )}
          {o.is_active && <button onClick={() => setConfirm('deactivate')} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">Deaktiviraj</button>}
        </div>
        {o.rejection_reason && <p className="text-sm text-rose-300 mt-3">Razlog odbijanja: {o.rejection_reason}</p>}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Događaji</p><p className="text-xl font-semibold">{o.events?.length || 0}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Ulaznice</p><p className="text-xl font-semibold">{o.tickets_sold || 0}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Prihod</p><p className="text-xl font-semibold">{o.revenue || 0}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Provizija</p><p className="text-xl font-semibold">{o.platform_fee || 0}</p></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Događaji</h2>
          {o.events?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema događaja.</p>}
          <div className="mt-3 space-y-2">{o.events?.map((e: any) => (
            <div key={e.id} className="text-sm border-b border-white/5 pb-2"><p className="font-medium">{e.title}</p><p className="text-xs text-zinc-500">{e.status}</p></div>
          ))}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Narudžbe</h2>
          {o.orders?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema narudžbi.</p>}
          <div className="mt-3 space-y-2">{o.orders?.map((ord: any) => (
            <div key={ord.id} className="text-sm border-b border-white/5 pb-2"><p className="font-medium">{ord.reference || `#${ord.id}`}</p><p className="text-xs text-zinc-500">{ord.status} · {ord.total_amount}</p></div>
          ))}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Historija odluka</h2>
        {o.history?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema administrativnih odluka.</p>}
        <div className="mt-3 space-y-2">{o.history?.map((h: any) => (
          <div key={h.id} className="text-sm border-b border-white/5 pb-2">
            <p className="font-medium">{h.action}</p>
            <p className="text-xs text-zinc-500">{h.created_at || '—'} · korisnik {h.user_id}{h.details?.reason ? ` · ${h.details.reason}` : ''}</p>
          </div>
        ))}</div>
      </div>

      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#12121f] border border-white/10 rounded-2xl p-5 max-w-sm w-full">
            <h2 className="font-semibold">Potvrda</h2>
            <p className="text-sm text-zinc-300 mt-2">{confirm} — {o.name}. Promjena se bilježi u audit logu.</p>
            {(confirm === 'reject' || confirm === 'suspend') && (
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
