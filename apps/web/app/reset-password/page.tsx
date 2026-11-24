'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

function ResetInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(params.get('token') || '');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr(''); setMsg('');
    try {
      const r = await fetch(`${API}/auth/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, new_password: pw }) });
      const d = await r.json();
      if (r.ok) { setMsg('Lozinka promijenjena.'); setTimeout(() => router.push('/login'), 1500); }
      else setErr(d.detail || 'Greška');
    } catch { setErr('Greška mreže'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0b1f] px-4">
      <div className="w-full max-w-sm bg-white/5 rounded-2xl p-6">
        <h1 className="text-xl font-bold mb-4">Nova lozinka</h1>
        <input value={token} onChange={e => setToken(e.target.value)} placeholder="Token" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3 text-sm" />
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Nova lozinka" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3 text-sm" />
        <button onClick={submit} className="w-full bg-purple-600 py-2 rounded-lg text-sm">Postavi</button>
        {msg && <p className="text-emerald-400 text-sm mt-3">{msg}</p>}
        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return <Suspense fallback={<p>Učitavanje...</p>}><ResetInner /></Suspense>;
}
