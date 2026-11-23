'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [t, setT] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`/admin/tickets/${id}`)
      .then(setT)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-zinc-400 text-sm">Učitavanje ulaznice...</p>;
  if (error) return <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>;
  if (!t) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/tickets" className="hover:text-white">Ulaznice</Link>
        <span>/</span>
        <span>{t.code}</span>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Poništavanje ulaznice nije podržano backendom. QR sadržaj se ne prikazuje.
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{t.code}</h1>
            <p className="text-sm text-zinc-400 mt-1">ID {t.id} · {t.ticket_type || '—'}</p>
            <p className="text-xs text-zinc-500 mt-1">QR prisutan: {t.qr_present ? 'da' : 'ne'}</p>
          </div>
          <div className="text-sm">
            <p><span className="text-zinc-400">Status:</span> <span className="uppercase">{t.status}</span></p>
            <p><span className="text-zinc-400">Cijena:</span> {t.price ?? '—'}</p>
            <p><span className="text-zinc-400">Kupovina:</span> {t.created_at ? new Date(t.created_at).toLocaleString() : '—'}</p>
            <p><span className="text-zinc-400">Ulaz:</span> {t.used_at ? new Date(t.used_at).toLocaleString() : 'nije iskorištena'}</p>
            {t.used_by && <p><span className="text-zinc-400">Skenirao:</span> {t.used_by}</p>}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Kupac</h2>
          {t.buyer ? (
            <div className="text-sm mt-2">
              <p>{t.buyer.full_name || t.buyer.email}</p>
              <p className="text-zinc-400">{t.buyer.email}</p>
              <Link href={`/admin/users/${t.buyer.id}`} className="text-xs text-[#d4af77] hover:underline">Profil kupca</Link>
            </div>
          ) : <p className="text-sm text-zinc-400 mt-2">Nema kupca.</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Događaj i organizator</h2>
          {t.event ? (
            <div className="text-sm mt-2">
              <p>{t.event.title}</p>
              <p className="text-zinc-400">{t.event.city || '—'} · {t.event.start_at ? new Date(t.event.start_at).toLocaleString() : '—'}</p>
              <Link href={`/admin/events/${t.event.id}`} className="text-xs text-[#d4af77] hover:underline">Detalji događaja</Link>
            </div>
          ) : <p className="text-sm text-zinc-400 mt-2">Nema događaja.</p>}
          {t.organizer && <p className="text-sm text-zinc-400 mt-2">Organizator: {t.organizer.name}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Narudžba</h2>
        {t.order ? (
          <div className="text-sm mt-2">
            <p>{t.order.reference || `#${t.order.id}`} · {t.order.status}</p>
            <p className="text-zinc-400">{t.order.created_at ? new Date(t.order.created_at).toLocaleString() : '—'}</p>
            <Link href="/admin/orders" className="text-xs text-[#d4af77] hover:underline">Narudžbe</Link>
          </div>
        ) : <p className="text-sm text-zinc-400 mt-2">Nema narudžbe.</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Historija</h2>
        <p className="text-sm text-zinc-400 mt-2">Audit zapisi za pojedinačnu ulaznicu nisu odvojeni. Status se čita iz modela i narudžbe.</p>
      </div>
    </div>
  );
}
