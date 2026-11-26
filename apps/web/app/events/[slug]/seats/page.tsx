'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

const TYPE_COLOR: Record<string, string> = {
  VIP: '#E5AD54',
  TRIBUNE: '#3B82F6',
  STANDING: '#10B981',
  SPECIAL: '#EC4899',
  STANDARD: '#8B5CF6',
};

export default function SeatMapPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [map, setMap] = useState<any>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const er = await fetch(`${API}/events/slug/${slug}`);
        if (!er.ok) { setErr('Događaj nije pronađen'); setLoading(false); return; }
        const ev = await er.json();
        setEvent(ev);
        const mr = await fetch(`${API}/seat-maps/event/${ev.id}`);
        const md = await mr.json();
        const sm = md?.sectors ? md : md?.seat_map;
        setMap(sm || null);
      } catch { setErr('Greška pri učitavanju'); }
      setLoading(false);
    })();
  }, [slug]);

  const toggle = (seat: any) => {
    if (seat.status !== 'FREE') return;
    setSelected(prev => prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : [...prev, seat.id]);
  };

  const findSeat = (id: number) => {
    for (const s of map?.sectors || [])
      for (const r of s.rows || [])
        for (const seat of r.seats || [])
          if (seat.id === id) return { seat, sector: s, row: r };
    return null;
  };

  const total = selected.reduce((sum, id) => {
    const f = findSeat(id);
    return sum + (f?.seat.price || 0);
  }, 0);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
  };
  const onPointerUp = () => { drag.current = null; };

  const continuePay = async () => {
    if (!selected.length) return;
    const token = localStorage.getItem('token');
    if (!token) { router.push(`/login?next=/events/${slug}/seats`); return; }
    setBusy(true);
    setErr('');
    try {
      const rr = await fetch(`${API}/seat-maps/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seat_ids: selected }),
      });
      if (!rr.ok) {
        const d = await rr.json().catch(() => ({}));
        throw new Error(d.detail || 'Rezervacija nije uspjela');
      }
      const cr = await fetch(`${API}/seat-maps/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seat_ids: selected }),
      });
      const cd = await cr.json();
      if (!cr.ok) throw new Error(cd.detail || 'Checkout nije uspio');
      router.push(`/checkout?order=${cd.order_id}`);
    } catch (e: any) {
      setErr(e.message || 'Greška');
      setBusy(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#101B35] text-white flex items-center justify-center">Učitavanje mape...</div>;
  if (err && !map) return <div className="min-h-screen bg-[#101B35] text-white p-8">{err}</div>;
  if (!map) return (
    <div className="min-h-screen bg-[#101B35] text-white p-8 text-center">
      <p>Ovaj događaj nema mapu sjedišta.</p>
      <a href={`/events/${slug}`} className="mt-4 inline-block text-[#E5AD54]">Nazad na događaj</a>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b1224] text-white pb-28">
      <header className="sticky top-0 z-30 bg-[#101B35]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <a href={`/events/${slug}`} className="text-sm text-white/70">← {event?.title || 'Događaj'}</a>
        <span className="text-xs text-white/50">{map.stats?.free} slobodno / {map.stats?.total}</span>
      </header>

      <div className="relative h-[62vh] overflow-hidden touch-none" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <div
          className="origin-center transition-transform duration-75"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` }}
        >
          <div className="mx-auto mt-6 mb-4 w-48 h-6 bg-gradient-to-b from-white/20 to-transparent rounded-t-full text-center text-[10px] tracking-[0.3em] text-white/50 pt-1">BINA</div>
          <div className="px-4 space-y-6">
            {map.sectors.map((sector: any) => {
              const color = sector.color || TYPE_COLOR[sector.sector_type] || TYPE_COLOR.STANDARD;
              return (
                <div key={sector.id}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold" style={{ color }}>{sector.name}</span>
                    <span className="text-[10px] text-white/40">{sector.sector_type} · {sector.base_price} {sector.currency}</span>
                  </div>
                  {sector.is_numbered === false ? (
                    <p className="text-xs text-white/50 px-1">Stajanje · kapacitet {sector.capacity || '—'}</p>
                  ) : (
                    sector.rows.map((row: any) => (
                      <div key={row.id} className="flex items-center gap-1.5 mb-1">
                        <span className="w-6 text-[10px] text-white/40 text-right">{row.label}</span>
                        <div className="flex flex-wrap gap-1">
                          {row.seats.map((seat: any) => {
                            const on = selected.includes(seat.id);
                            const free = seat.status === 'FREE';
                            const bg = on ? '#E5AD54' : seat.status === 'SOLD' ? '#3f3f46' : seat.status === 'RESERVED' ? '#a16207' : color;
                            return (
                              <button
                                key={seat.id}
                                disabled={!free}
                                onClick={(e) => { e.stopPropagation(); toggle(seat); }}
                                className="w-6 h-6 md:w-7 md:h-7 rounded-sm text-[9px] font-medium text-white disabled:opacity-50"
                                style={{ background: bg }}
                                title={`${sector.name} · red ${row.label} · ${seat.number} · ${seat.price} EUR`}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button onClick={() => setScale(s => Math.min(2.2, s + 0.2))} className="w-9 h-9 rounded-lg bg-[#101B35]/90 border border-white/15 text-lg">+</button>
          <button onClick={() => setScale(s => Math.max(0.6, s - 0.2))} className="w-9 h-9 rounded-lg bg-[#101B35]/90 border border-white/15 text-lg">−</button>
          <button onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }} className="w-9 h-9 rounded-lg bg-[#101B35]/90 border border-white/15 text-[10px]">1:1</button>
        </div>

        <div className="absolute left-3 bottom-3 flex gap-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#8B5CF6]" />Slobodno</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#E5AD54]" />Odabrano</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-zinc-700" />Prodano</span>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="px-4 py-3 text-xs text-white/70 space-y-0.5">
          {selected.map(id => {
            const f = findSeat(id);
            if (!f) return null;
            return <p key={id}>{f.sector.name} · red {f.row.label} · sjedište {f.seat.number} · {f.seat.price.toFixed(2)} EUR</p>;
          })}
        </div>
      )}
      {err && <p className="px-4 text-sm text-red-400">{err}</p>}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#101B35] border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-white/50">{selected.length} ulaznica</p>
          <p className="text-lg font-bold text-[#E5AD54]">{total.toFixed(2)} EUR</p>
        </div>
        <button
          onClick={continuePay}
          disabled={!selected.length || busy}
          className="bg-[#E5AD54] text-[#101B35] font-bold px-5 py-3 rounded-xl text-sm disabled:opacity-40"
        >
          {busy ? 'Rezerviram...' : 'NASTAVI NA PLAĆANJE'}
        </button>
      </div>
    </div>
  );
}
