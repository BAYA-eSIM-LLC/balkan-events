'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/me/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => {
      if (r.status === 404) { setMissing(true); return []; }
      return r.ok ? r.json() : [];
    }).then(d => setTickets(Array.isArray(d) ? d : d.results || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f5fb]">
      <div className="bg-[#0d0b1f] text-white py-12">
        <div className="max-w-4xl mx-auto px-5">
          <h1 className="text-3xl font-display font-semibold">Moje ulaznice</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-5 py-8">
        {loading && <p>Učitavanje...</p>}
        {missing && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
            <p className="font-medium">Funkcija još nije dostupna na serveru</p>
            <p className="text-sm mt-1">Endpoint /me/tickets nije deployan. QR kodovi će se prikazati kada backend bude aktivan.</p>
          </div>
        )}
        {!loading && !missing && tickets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">Nemaš kupljenih ulaznica.</p>
            <Link href="/search" className="mt-4 inline-block text-[#6d3df5]">Pronađi događaje</Link>
          </div>
        )}
        <div className="space-y-4">
          {tickets.map((t: any) => (
            <div key={t.id} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <h3 className="font-semibold">{t.event_title || t.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{t.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
