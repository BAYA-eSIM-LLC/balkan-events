'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ScannerPage() {
  const [qr, setQr] = useState('');
  const [eventId, setEventId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [offline, setOffline] = useState(false);

  const scan = async () => {
    const token = localStorage.getItem('token');
    if (offline) {
      const queue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
      queue.push({ qr_data: qr, event_id: Number(eventId), scanned_at: new Date().toISOString() });
      localStorage.setItem('offline_scans', JSON.stringify(queue));
      setResult({ status: 'QUEUED', note: 'Offline. Will sync later. Not a guaranteed check.' });
      return;
    }
    const r = await fetch(`${API}/scanner/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ qr_data: qr, event_id: Number(eventId) }),
    });
    setResult(await r.json());
  };

  const sync = async () => {
    const token = localStorage.getItem('token');
    const queue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
    const r = await fetch(`${API}/scanner/offline/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(queue),
    });
    const d = await r.json();
    localStorage.removeItem('offline_scans');
    setResult(d);
  };

  const color = result?.status === 'VALID' ? 'bg-green-100 text-green-800' : result ? 'bg-red-100 text-red-800' : '';

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scanner</h1>
      <label className="flex items-center gap-2 text-sm mb-2">
        <input type="checkbox" checked={offline} onChange={e => setOffline(e.target.checked)} />
        Offline mode (not a guaranteed check)
      </label>
      <input className="border p-2 w-full mb-2" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="QR code or manual entry" value={qr} onChange={e => setQr(e.target.value)} />
      <button onClick={scan} className="bg-black text-white px-4 py-3 rounded w-full text-lg">Scan</button>
      {offline && <button onClick={sync} className="border px-4 py-2 rounded w-full mt-2">Sync offline scans</button>}
      {result && (
        <div className={`mt-4 p-6 rounded text-center text-2xl font-bold ${color}`}>
          {result.status || 'RESULT'}
          {result.note && <p className="text-xs font-normal mt-2">{result.note}</p>}
          {result.limitation && <p className="text-xs font-normal mt-2">{result.limitation}</p>}
        </div>
      )}
    </div>
  );
}
