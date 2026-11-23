'use client';

import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ScannerPage() {
  const [qr, setQr] = useState('');
  const [eventId, setEventId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [offline, setOffline] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastScan = useRef<string>('');

  const validate = async (code: string) => {
    if (!code || code === lastScan.current) return;
    lastScan.current = code;
    const token = localStorage.getItem('token');
    const deviceToken = localStorage.getItem('device_token');
    if (offline) {
      const queue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
      queue.push({ qr_data: code, event_id: Number(eventId), scanned_at: new Date().toISOString(), client_id: crypto.randomUUID() });
      localStorage.setItem('offline_scans', JSON.stringify(queue));
      setResult({ status: 'QUEUED', note: 'Offline. Not a confirmed entry.' });
      return;
    }
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (deviceToken) headers['X-Device-Token'] = deviceToken;
    const r = await fetch(`${API}/scanner/validate`, {
      method: 'POST', headers,
      body: JSON.stringify({ qr_data: code, event_id: Number(eventId) }),
    });
    setResult(await r.json());
  };

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported on this device');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch {
      setCameraError('Camera permission denied');
    }
  };

  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;
    let detector: any;
    let timer: any;
    const run = async () => {
      if (!('BarcodeDetector' in window)) {
        setCameraError('QR detector not available. Use manual entry.');
        return;
      }
      detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
      timer = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.length) validate(codes[0].rawValue);
        } catch {}
      }, 500);
    };
    run();
    return () => clearInterval(timer);
  }, [cameraOn, eventId]);

  const sync = async () => {
    const token = localStorage.getItem('token');
    const queue = JSON.parse(localStorage.getItem('offline_scans') || '[]');
    const r = await fetch(`${API}/scanner/offline/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(queue),
    });
    setResult(await r.json());
    localStorage.removeItem('offline_scans');
  };

  const color = result?.status === 'VALID' ? 'bg-green-100 text-green-800' : result ? 'bg-red-100 text-red-800' : '';

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Scanner</h1>
      <label className="flex items-center gap-2 text-sm mb-2">
        <input type="checkbox" checked={offline} onChange={e => setOffline(e.target.checked)} />
        Offline (not a confirmed entry)
      </label>
      <input className="border p-2 w-full mb-2" placeholder="Event ID" value={eventId} onChange={e => setEventId(e.target.value)} />
      <button onClick={startCamera} className="border px-4 py-2 rounded w-full mb-2">Start camera</button>
      {cameraError && <p className="text-sm text-red-600 mb-2">{cameraError}</p>}
      {cameraOn && <video ref={videoRef} autoPlay playsInline className="w-full rounded mb-2" />}
      <input className="border p-2 w-full mb-2" placeholder="Manual code" value={qr} onChange={e => setQr(e.target.value)} />
      <button onClick={() => validate(qr)} className="bg-black text-white px-4 py-3 rounded w-full text-lg">Scan</button>
      {offline && <button onClick={sync} className="border px-4 py-2 rounded w-full mt-2">Sync</button>}
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
