'use client';
import { useState, useRef, useEffect } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { useOrganizer } from '@/lib/organizer-context';

export default function OrganizerScanner() {
  const { events, activeOrg, loading } = useOrganizer();
  const [result, setResult] = useState<any>(null);
  const [qr, setQr] = useState('');
  const [eventId, setEventId] = useState('');
  const [camera, setCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scan = (data: string) => {
    if (!eventId || !data) return;
    adminFetch('/scanner/validate', {
      method: 'POST',
      body: JSON.stringify({ qr_data: data, event_id: parseInt(eventId) })
    }).then(setResult).catch(e => setResult({ status: 'ERROR', reason: e.message }));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCamera(true);
        detectQR();
      }
    } catch (e) {
      setResult({ status: 'ERROR', reason: 'Kamera nije dostupna' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setCamera(false);
  };

  const detectQR = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    const check = () => {
      if (!camera || !video.videoWidth) { requestAnimationFrame(check); return; }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        detector.detect(canvas).then((codes: any[]) => {
          if (codes.length > 0) {
            stopCamera();
            setQr(codes[0].rawValue);
            scan(codes[0].rawValue);
          } else requestAnimationFrame(check);
        }).catch(() => requestAnimationFrame(check));
      } else requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
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
        <button onClick={camera ? stopCamera : startCamera} className="w-full bg-blue-600 px-4 py-2 rounded-lg text-sm">
          {camera ? 'Zaustavi kameru' : 'Otvori kameru'}
        </button>
        {camera && (
          <div className="relative">
            <video ref={videoRef} className="w-full rounded-lg" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>
      {result && (
        <div className={`mt-4 p-4 rounded-xl text-sm ${result.status === 'VALID' ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>
          Status: {result.status} {result.reason && `· ${result.reason}`}
        </div>
      )}
    </div>
  );
}
