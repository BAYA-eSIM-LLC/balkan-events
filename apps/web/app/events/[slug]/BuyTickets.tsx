'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function BuyTickets({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [types, setTypes] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`${API}/events/${eventId}/ticket-types`).then(r => r.json()).then(setTypes).catch(() => setTypes([]));
  }, [eventId]);

  const buy = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push(`/login?next=/events/${eventId}`); return; }
    if (!selected) return;
    try {
      const r = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: [{ ticket_type_id: selected, quantity: 1 }] }),
      });
      const d = await r.json();
      if (r.ok) {
        router.push(`/checkout?order=${d.id}`);
      } else if (r.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        router.push(`/login?next=/events/${eventId}`);
      } else {
        setMsg(d.detail || 'Greška');
      }
    } catch { setMsg('Greška pri kreiranju narudžbe'); }
  };

  if (!types.length) return <p className="text-gray-500 text-sm">Nema dostupnih ulaznica.</p>;

  return (
    <div className="mt-6 space-y-3">
      {types.map(t => (
        <label key={t.id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer ${selected === t.id ? 'border-[#6d3df5] bg-purple-50' : 'border-gray-200'}`}>
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="text-sm text-gray-500">{t.available} dostupno</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{t.price} {t.currency}</p>
            <input type="radio" name="ticket" checked={selected === t.id} onChange={() => setSelected(t.id)} />
          </div>
        </label>
      ))}
      <button onClick={buy} disabled={!selected} className="w-full bg-[#6d3df5] disabled:opacity-40 text-white py-3 rounded-xl font-medium">
        Kupi ulaznicu
      </button>
      {msg && <p className="text-red-500 text-sm">{msg}</p>}
    </div>
  );
}
