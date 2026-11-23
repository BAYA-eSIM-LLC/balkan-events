'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [e, setE] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>({});

  function load() {
    setLoading(true);
    adminFetch(`/admin/events/${id}`)
      .then(d => { setE(d); setForm({ title: d.title, short_description: d.short_description || '', description: d.description || '', city: d.city || '', venue_name: d.venue_name || '', venue_address: d.venue_address || '', image_url: d.image_url || '' }); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [id]);

  async function act() {
    if (!confirm) return;
    if (confirm === 'reject' && !reason.trim()) {
      setError('Obrazloženje je obavezno.');
      return;
    }
    setBusy(true);
    try {
      const qs = reason.trim() ? `?reason=${encodeURIComponent(reason.trim())}` : '';
      await adminFetch(`/admin/events/${id}/${confirm}${qs}`, { method: 'POST' });
      setConfirm(null);
      setReason('');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await adminFetch(`/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
      setEdit(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="text-zinc-400 text-sm">Učitavanje događaja...</p>;
  if (error && !e) return <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>;
  if (!e) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/events" className="hover:text-white">Događaji</Link>
        <span>/</span>
        <span>{e.title}</span>
      </div>
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-3 text-sm">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {e.image_url && <img src={e.image_url} alt="" className="w-full sm:w-40 h-28 object-cover rounded-xl" />}
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{e.title}</h1>
            <p className="text-sm text-zinc-400 mt-1">{e.organization?.name || '—'} · {e.city || '—'} · {e.venue_name || '—'}</p>
            <p className="text-xs text-zinc-500 mt-1 uppercase">{e.status} · {e.category || 'nema kategoriju'} · {e.start_at ? new Date(e.start_at).toLocaleString() : '—'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {e.status === 'SUBMITTED' && <button onClick={() => setConfirm('approve')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-sm">Odobri</button>}
          {e.status === 'APPROVED' && <button onClick={() => setConfirm('publish')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-200 text-sm">Objavi</button>}
          {e.status === 'PUBLISHED' && <button onClick={() => setConfirm('suspend')} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">Deaktiviraj</button>}
          {e.status === 'SUBMITTED' && <button onClick={() => setConfirm('reject')} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-200 text-sm">Vrati u nacrt</button>}
          {['SUBMITTED', 'APPROVED', 'PUBLISHED', 'SUSPENDED'].includes(e.status) && <button onClick={() => setConfirm('cancel')} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm">Otkaži</button>}
          <button onClick={() => setEdit(!edit)} className="px-3 py-1.5 rounded-lg border border-white/10 text-sm">{edit ? 'Zatvori' : 'Uredi'}</button>
        </div>
      </div>

      {edit && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-2">
          <h2 className="font-semibold">Uređivanje</h2>
          {['title', 'short_description', 'description', 'city', 'venue_name', 'venue_address', 'image_url'].map(f => (
            <input key={f} value={form[f] || ''} onChange={ev => setForm({ ...form, [f]: ev.target.value })} placeholder={f} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          ))}
          <button onClick={save} disabled={busy} className="px-4 py-2 rounded-lg bg-white text-black text-sm disabled:opacity-50">Spremi</button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Kapacitet</p><p className="text-xl font-semibold">{e.capacity || 0}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Prodano</p><p className="text-xl font-semibold">{e.sold || 0}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Raspoloživo</p><p className="text-xl font-semibold">{e.available || 0}</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-zinc-400">Prihod</p><p className="text-xl font-semibold">{e.revenue || 0}</p></div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Opis</h2>
        <p className="text-sm text-zinc-300 mt-2 whitespace-pre-wrap">{e.description || e.short_description || 'Nema opisa.'}</p>
        <p className="text-xs text-zinc-500 mt-2">{e.venue_address || 'Nema adrese.'}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Vrste ulaznica</h2>
          {e.ticket_types?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema vrsta ulaznica.</p>}
          <div className="mt-3 space-y-2">{e.ticket_types?.map((t: any) => (
            <div key={t.id} className="text-sm border-b border-white/5 pb-2"><p className="font-medium">{t.name}</p><p className="text-xs text-zinc-500">{t.price} · {t.quantity_sold}/{t.quantity_total}</p></div>
          ))}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Narudžbe</h2>
          {e.orders?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema narudžbi.</p>}
          <div className="mt-3 space-y-2">{e.orders?.map((o: any) => (
            <div key={o.id} className="text-sm border-b border-white/5 pb-2"><p className="font-medium">{o.reference || `#${o.id}`}</p><p className="text-xs text-zinc-500">{o.status} · {o.total_amount}</p></div>
          ))}</div>
        </div>
      </div>

      {e.gallery?.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Fotografije</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto">{e.gallery.map((g: string, i: number) => <img key={i} src={g} alt="" className="h-24 rounded-lg" />)}</div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Historija promjena</h2>
        {e.history?.length === 0 && <p className="text-sm text-zinc-400 mt-3">Nema administrativnih promjena.</p>}
        <div className="mt-3 space-y-2">{e.history?.map((h: any) => (
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
            <p className="text-sm text-zinc-300 mt-2">{confirm} — {e.title}. Promjena se bilježi u audit logu.</p>
            {confirm === 'reject' && <textarea value={reason} onChange={ev => setReason(ev.target.value)} placeholder="Obavezno obrazloženje" className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm" rows={3} />}
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
