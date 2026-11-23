'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SeatMapPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [map, setMap] = useState<any>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/seat-maps/event/${eventId}`)
      .then(r => r.json())
      .then(d => { setMap(d.seat_map || d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const toggle = (seat: any) => {
    if (seat.status !== 'FREE') return;
    setSelected(prev => prev.includes(seat.id) ? prev.filter(id => id !== seat.id) : [...prev, seat.id]);
  };

  const total = selected.reduce((sum, id) => {
    for (const s of map?.sectors || [])
      for (const r of s.rows || [])
        for (const seat of r.seats || [])
          if (seat.id === id) return sum + seat.price;
    return sum;
  }, 0);

  if (loading) return <div className="p-8">Loading seat map...</div>;
  if (!map || !map.sectors) return <div className="p-8">No seat map for this event.</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{map.name}</h1>
      <p className="mb-4 text-sm text-gray-600">Free: {map.stats?.free} / {map.stats?.total}</p>
      {map.sectors.map((sector: any) => (
        <div key={sector.id} className="mb-6 border rounded p-4">
          <h2 className="font-semibold mb-2">{sector.name} ({sector.sector_type}) — {sector.base_price} {sector.currency}</h2>
          {sector.rows.map((row: any) => (
            <div key={row.id} className="flex items-center gap-2 mb-2">
              <span className="w-8 text-xs text-gray-500">{row.label}</span>
              <div className="flex flex-wrap gap-1">
                {row.seats.map((seat: any) => {
                  const isSelected = selected.includes(seat.id);
                  const bg = seat.status === 'SOLD' ? 'bg-red-500' : seat.status === 'RESERVED' ? 'bg-yellow-400' : isSelected ? 'bg-green-500' : 'bg-gray-200';
                  return (
                    <button
                      key={seat.id}
                      disabled={seat.status !== 'FREE'}
                      onClick={() => toggle(seat)}
                      className={`w-8 h-8 text-xs rounded ${bg} hover:opacity-80 disabled:cursor-not-allowed`}
                      title={`${seat.number || ''} ${seat.price} ${sector.currency}`}
                    >
                      {seat.number || '•'}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center">
          <span>{selected.length} seats — {total.toFixed(2)} EUR</span>
          <button className="bg-black text-white px-4 py-2 rounded">Continue to checkout</button>
        </div>
      )}
    </div>
  );
}
