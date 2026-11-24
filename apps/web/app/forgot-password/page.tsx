'use client';
import { useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const submit = async () => {
    setErr(''); setMsg('');
    try {
      const r = await fetch(`${API}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const d = await r.json();
      if (r.ok) setMsg(d.message || 'Provjeri e-mail.');
      else setErr(d.detail || 'Greška');
    } catch { setErr('Greška mreže'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0b1f] px-4">
      <div className="w-full max-w-sm bg-white/5 rounded-2xl p-6">
        <h1 className="text-xl font-bold mb-4">Zaboravljena lozinka</h1>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-mail" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-3 text-sm" />
        <button onClick={submit} className="w-full bg-purple-600 py-2 rounded-lg text-sm">Pošalji</button>
        {msg && <p className="text-emerald-400 text-sm mt-3">{msg}</p>}
        {err && <p className="text-red-400 text-sm mt-3">{err}</p>}
        <Link href="/login" className="block text-center text-xs text-zinc-400 mt-4">Nazad na prijavu</Link>
      </div>
    </div>
  );
}
