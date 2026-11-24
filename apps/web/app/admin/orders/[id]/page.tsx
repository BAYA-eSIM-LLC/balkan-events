'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [o, setO] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch(`/admin/orders/${id}`)
      .then(setO)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-zinc-400 text-sm">Učitavanje narudžbe...</p>;
  if (error) return <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>;
  if (!o) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/admin/orders" className="hover:text-white">Narudžbe</Link>
        <span>/</span>
        <span>{o.reference || `#${o.id}`}</span>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        Refund je moguć samo uz konfigurirani Stripe. U TEST okruženju nije aktiviran. Nema izvoza.
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{o.reference || `#${o.id}`}</h1>
            <p className="text-sm text-zinc-400 mt-1">ID {o.id}</p>
          </div>
          <div className="text-sm">
            <p><span className="text-zinc-400">Status:</span> <span className="uppercase">{o.status}</span></p>
            <p><span className="text-zinc-400">Iznos:</span> {o.total_amount} {o.currency}</p>
            <p><span className="text-zinc-400">Kreirano:</span> {o.created_at ? new Date(o.created_at).toLocaleString() : '—'}</p>
            <p><span className="text-zinc-400">Rezervacija do:</span> {o.reserved_until ? new Date(o.reserved_until).toLocaleString() : '—'}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Kupac</h2>
          {o.buyer ? (
            <div className="text-sm mt-2">
              <p>{o.buyer.full_name || o.buyer.email}</p>
              <p className="text-zinc-400">{o.buyer.email}</p>
              <Link href={`/admin/users/${o.buyer.id}`} className="text-xs text-[#d4af77] hover:underline">Profil kupca</Link>
            </div>
          ) : <p className="text-sm text-zinc-400 mt-2">Korisnik ID {o.user_id}</p>}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-semibold">Organizatori</h2>
          {o.organizers?.length ? (
            <ul className="text-sm mt-2 space-y-1">
              {o.organizers.map((org: any) => (
                <li key={org.id}><Link href={`/admin/organizations/${org.id}`} className="text-[#d4af77] hover:underline">{org.name}</Link></li>
              ))}
            </ul>
          ) : <p className="text-sm text-zinc-400 mt-2">Nema organizatora.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Stavke</h2>
        {o.items?.length ? (
          <div className="mt-2 space-y-2 text-sm">
            {o.items.map((i: any, idx: number) => (
              <div key={idx} className="flex justify-between border-b border-white/5 pb-1">
                <span>{i.ticket_type_name || '—'} × {i.quantity}</span>
                <span className="text-zinc-400">{i.event_title || '—'} · {i.unit_price}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-zinc-400 mt-2">Nema stavki.</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Ulaznice</h2>
        {o.tickets?.length ? (
          <div className="mt-2 space-y-1 text-sm">
            {o.tickets.map((t: any) => (
              <Link key={t.id} href={`/admin/tickets/${t.id}`} className="block text-[#d4af77] hover:underline">
                {t.code} · {t.is_used ? 'iskorištena' : 'aktivna'}
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-zinc-400 mt-2">Nema izdanih ulaznica.</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Plaćanja i refundacije</h2>
        {o.payments?.length ? (
          <div className="mt-2 space-y-3 text-sm">
            {o.payments.map((p: any) => (
              <div key={p.id} className="border-b border-white/5 pb-2">
                <p>{p.provider || '—'} · {p.status} · {p.amount} {p.currency}</p>
                <p className="text-xs text-zinc-400">Naknada Stripe: {p.stripe_fee ?? '—'} · Provizija platforme: {p.platform_fee ?? '—'}</p>
                <p className="text-xs text-zinc-500">Provider ID: {p.provider_id_prefix || '—'}</p>
                {p.refunds?.length > 0 && (
                  <div className="mt-1 text-xs text-amber-200">
                    Refundacije: {p.refunds.map((r: any) => `${r.amount} (${r.status})`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-zinc-400 mt-2">Nema plaćanja. Refund nije moguć bez Stripe konfiguracije.</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-semibold">Historija (Audit)</h2>
        {o.audit?.length ? (
          <ul className="mt-2 space-y-1 text-sm text-zinc-400">
            {o.audit.map((a: any, idx: number) => (
              <li key={idx}>{a.action} · {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}</li>
            ))}
          </ul>
        ) : <p className="text-sm text-zinc-400 mt-2">Nema audit zapisa za ovu narudžbu.</p>}
      </div>
    </div>
  );
}
