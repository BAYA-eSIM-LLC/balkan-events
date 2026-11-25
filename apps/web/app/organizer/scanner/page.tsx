'use client';
import { useState, useRef, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

declare global {
  interface Window { jsQR: any; }
}

export default function OrganizerScanner() {
  const { events, activeOrg, loading } = useOrganizer();
  const [result, setResult] = useState<any>(null);
  const [qr, setQr] = useState('');
  const [eventId, setEventId] = useState('');
  const [jsLoaded, setJsLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
    script.onload = () => setJsLoaded(true);
    document.body.appendChild(script);
  }, []);

  const scan = (data: string) => {
    if (!eventId || !data) return;
    adminFetch('/scanner/validate', {
      method: 'POST',
      body: JSON.stringify({ qr_data: data, event_id: parseInt(eventId) })
    }).then(setResult).catch(e => setResult({ status: 'ERROR', reason: e.message }));
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!jsLoaded || !window.jsQR) {
      setResult({ status: 'ERROR', reason: 'Učitavanje... pokušaj ponovo' });
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (imageData) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          setQr(code.data);
          scan(code.data);
        } else {
          setResult({ status: 'ERROR', reason: 'QR kod nije pronađen u slici' });
        }
      }
    };
    img.src = URL.createObjectURL(file);
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
        <div className="flex gap-2">
          <input value={qr} onChange={e => setQr(e.target.value)} placeholder="QR data" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" />
          <button onClick={() => scan(qr)} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Validiraj</button>
        </div>
        <button onClick={() => fileRef.current?.click()} className="w-full bg-emerald-600 px-4 py-2 rounded-lg text-sm">
          Upload slike QR koda
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </div>
      {result && (
        <div className={`mt-4 p-4 rounded-xl text-sm ${result.status === 'VALID' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
          Status: {result.status} {result.reason && `· ${result.reason}`}
        </div>
      )}
    </div>
  );
}
