'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function PublicTicket() {
  const { code } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/payments/tickets/public/${decodeURIComponent(code as string)}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(setTicket)
      .catch(e => setError(e.message || 'Ulaznica nije pronađena'));
  }, [code]);

  if (error) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><p>{error}</p></div>;
  if (!ticket) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><p>Učitavanje...</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1230] to-[#0d0b1f] text-white flex flex-col items-center justify-center p-4">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center">
        <p className="text-[#d4af77] text-xs tracking-widest mb-2">ULAZNICA</p>
        <h1 className="text-xl font-bold mb-4">{ticket.event_title}</h1>
        <div className="bg-white rounded-2xl p-4 mb-4">
          <img src={ticket.qr_png} alt="QR" className="w-full" />
        </div>
        <div className="text-sm text-zinc-300 space-y-1">
          <p>{ticket.ticket_type}</p>
          <p>{ticket.venue_name || ticket.city}</p>
          <p className="font-mono text-xs">{ticket.code}</p>
        </div>
        <p className="mt-4 text-emerald-400 text-sm">{ticket.status}</p>
      </div>
    </div>
  );
}
