'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminFetch } from '@/lib/admin-api';

export default function OrderDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    adminFetch(`/admin/orders/${id}`)
      .then(setOrder)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (error) return <div className="bg-amber-500/10 text-amber-200 p-4 rounded-xl">{error}</div>;
  if (!order) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Narudžba {order.reference || order.id}</h1>
      <p className="text-zinc-400 text-sm mb-6">Status: {order.status} · {order.total_amount} {order.currency}</p>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Osnovno</h3>
          <p>Korisnik: {order.user_id}</p>
          <p>Rezervacija do: {order.reserved_until || '—'}</p>
          <p>Kreirano: {order.created_at}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <h3 className="font-semibold mb-2">Stavke</h3>
          {order.items?.map((i: any, idx: number) => (
            <div key={idx} className="text-sm mb-1">
              {i.ticket_type_name} × {i.quantity} — {i.event_title}
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-semibold mb-2">Povezane ulaznice</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400 border-b border-white/10">
              <th className="pb-2">ID</th>
              <th className="pb-2">Kod</th>
              <th className="pb-2">Used</th>
              <th className="pb-2">QR preview</th>
            </tr>
          </thead>
          <tbody>
            {order.tickets?.map((t: any) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="py-2">{t.id}</td>
                <td>{t.code}</td>
                <td>{t.is_used ? 'Da' : 'Ne'}</td>
                <td className="font-mono text-xs">{t.qr_data_preview || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
