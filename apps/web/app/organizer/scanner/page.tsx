'use client';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerScanner() {
  const { events, activeOrg, loading } = useOrganizer();
  const [result, setResult] = useState<any>(null);
  const [qr, setQr] = useState('');
  const [eventId, setEventId] = useState('');

  const scan = () => {
    if (!eventId) return;
    adminFetch('/scanner/validate', {
      method: 'POST',
      body: JSON.stringify({ qr_data: qr, event_id: parseInt(eventId) })
    }).then(setResult).catch(e => setResult({ status: 'ERROR', reason: e.message }));
  };

  if (loading) return <p className="text-zinc-400">Učitavanje...</p>;
  if (!activeOrg) return <p className="text-amber-300">Nema aktivne organizacije.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">QR Scanner</h1>
      <p className="text-zinc-400 text-sm mb-4">{activeOrg.name}</p>
      <div className="space-y-3 max-w-md">
        <select value={eventId} onChange={e => setEventId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm">
          <option value="">Odaberi događaj</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        <input value={qr} onChange={e => setQr(e.target.value)} placeholder="QR data" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
        <button onClick={scan} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Validiraj</button>
      </div>
      {result && (
        <div className={`mt-4 p-4 rounded-xl text-sm ${result.status === 'VALID' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
          Status: {result.status} {result.reason && `· ${result.reason}`}
        </div>
      )}
    </div>
  );
}
