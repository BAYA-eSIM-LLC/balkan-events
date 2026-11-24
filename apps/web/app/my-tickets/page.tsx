'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

function TicketCard({ t, token }: { t: any; token: string }) {
  const [full, setFull] = useState(false);
  const status = t.order_status === 'paid' && !t.is_used ? 'VAŽEĆA' : t.is_used ? 'ISKORIŠTENA' : t.order_status?.toUpperCase();
  const qrUrl = t.qr_png;
  return (
    <>
      <article className="bg-gradient-to-b from-[#1a1230] to-[#0d0b1f] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
        {t.event_image && <img src={t.event_image} alt="" className="w-full h-40 object-cover" />}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[#d4af77] text-xs tracking-widest">ULAZNICA</p>
              <h2 className="text-xl font-bold mt-1">{t.event_title}</h2>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300">{status}</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-300">
            <div><span className="text-zinc-500">Datum</span><p>{t.start_at ? new Date(t.start_at).toLocaleString('bs-BA') : '—'}</p></div>
            <div><span className="text-zinc-500">Lokacija</span><p>{t.venue_name || t.city || '—'}</p></div>
            <div><span className="text-zinc-500">Tip</span><p>{t.ticket_type}</p></div>
            <div><span className="text-zinc-500">Broj</span><p className="font-mono text-xs">{t.code}</p></div>
            <div><span className="text-zinc-500">Narudžba</span><p>{t.reference}</p></div>
            <div><span className="text-zinc-500">Iznos</span><p>{t.total_amount} {t.currency}</p></div>
          </div>
          <div className="mt-4 bg-white rounded-2xl p-4 flex justify-center">
            <img src={qrUrl} alt="QR" className="w-48 h-48" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => setFull(true)} className="flex-1 bg-white/10 hover:bg-white/15 rounded-xl py-2 text-sm">Puni ekran</button>
            <a href={`${API}/tickets/${t.id}/pdf`} className="flex-1 bg-violet-600 hover:bg-violet-500 text-center rounded-xl py-2 text-sm">PDF</a>
          </div>
        </div>
      </article>
      {full && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setFull(false)}>
          <img src={qrUrl} alt="QR" className="w-72 h-72 bg-white rounded-2xl p-4" />
          <p className="mt-4 text-white text-sm">{t.event_title} · {t.code}</p>
          <p className="text-zinc-400 text-xs mt-1">Dodirni za zatvaranje · Spremi screenshotom</p>
        </div>
      )}
    </>
  );
}

export default function MyTickets() {
  const [walletStatus, setWalletStatus] = useState<any>(null);
  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || '/api') + '/wallets/status').then(r => r.json()).then(setWalletStatus).catch(() => {});
  }, []);
  const [tickets, setTickets] = useState<any[]>([]);
  const [needLogin, setNeedLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('token') || '';
    setToken(t);
    if (!t) { setNeedLogin(true); setLoading(false); return; }
    adminFetch('/payments/my-tickets')
      .then(setTickets)
      .catch(e => {
        if (String(e.message).includes('401') || String(e.message).includes('Invalid token')) {
          localStorage.removeItem('token');
          setNeedLogin(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (needLogin) {
    return (
      <div className="min-h-screen bg-[#0b0b1f] text-white p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-3">Moje ulaznice</h1>
          <p className="text-zinc-400 mb-6">Prijavite se da vidite svoje ulaznice.</p>
          <Link href="/login?next=/my-tickets" className="inline-block bg-violet-600 text-white px-6 py-3 rounded-xl font-semibold">Prijavi se</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07071a] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Moje ulaznice</h1>
        {loading && <p className="text-zinc-400">Učitavanje...</p>}
        <div className="space-y-6">
          {tickets.map(t => <TicketCard key={t.id} t={t} token={token} />)}
          {!loading && tickets.length === 0 && <p className="text-zinc-400">Nema ulaznica.</p>}
        </div>
      </div>
    </div>
  );
}
