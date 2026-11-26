'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminSeatMapsPage() {
  const [maps, setMaps] = useState<any[]>([]);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    adminFetch('/admin/seat-maps')
      .then(d => { setMaps(d.items || d || []); setLoading(false); })
      .catch((e: any) => { setErr(e.message || 'Greška'); setLoading(false); });
  }, []);

  const open = async (id: number) => {
    try {
      const d = await adminFetch(`/admin/seat-maps/${id}`);
      setDetail(d);
    } catch (e: any) { setErr(e.message); }
  };

  if (loading) return <div className="p-8">Učitavanje...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Mape sjedišta</h1>
      {err && <p className="text-red-400 text-sm mb-2">{err}</p>}
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b border-white/10"><th className="py-2">ID</th><th>Naziv</th><th>Event</th><th>Org</th><th>Aktivna</th><th></th></tr></thead>
        <tbody>
          {maps.map(m => (
            <tr key={m.id} className="border-b border-white/5">
              <td className="py-2">{m.id}</td>
              <td>{m.name}</td>
              <td>{m.event_id}</td>
              <td>{m.organization_id}</td>
              <td>{m.is_active ? 'Da' : 'Ne'}</td>
              <td><button onClick={() => open(m.id)} className="text-[#E5AD54] text-xs">Detalj</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {maps.length === 0 && <p className="text-zinc-500 mt-4">Nema mapa.</p>}

      {detail && (
        <div className="mt-6 bg-white/5 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold">{detail.name || detail.seat_map?.name}</p>
              <p className="text-xs text-zinc-400">Slobodno {detail.stats?.free ?? detail.seat_map?.stats?.free} / {detail.stats?.total ?? detail.seat_map?.stats?.total}</p>
            </div>
            <button onClick={() => setDetail(null)} className="text-xs text-zinc-400">Zatvori</button>
          </div>
          {(detail.sectors || detail.seat_map?.sectors || []).map((s: any) => (
            <div key={s.id} className="mt-3 text-sm">
              <p className="font-medium">{s.name} · {s.sector_type} · {s.base_price} {s.currency}</p>
              <p className="text-xs text-zinc-400">{s.rows?.length || 0} redova · {s.rows?.reduce((n: number, r: any) => n + (r.seats?.length || 0), 0) || 0} sjedišta</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
