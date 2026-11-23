'use client';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function OrganizerScanner() {
  const [result, setResult] = useState<any>(null);
  const [qr, setQr] = useState('');
  const [eventId, setEventId] = useState('');

  const scan = () => {
    adminFetch('/scanner/validate', {
      method: 'POST',
      body: JSON.stringify({ qr_data: qr, event_id: parseInt(eventId) })
    }).then(setResult).catch(e => setResult({ status: 'ERROR', reason: e.message }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">QR Scanner</h1>
      <p className="text-zinc-400 text-sm mb-4">Atomska validacija · Scanner uloga</p>
      <div className="space-y-3 max-w-md">
        <input value={eventId} onChange={e => setEventId(e.target.value)} placeholder="Event ID" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
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
