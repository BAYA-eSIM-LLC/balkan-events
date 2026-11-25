'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAccessToken } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      window.location.href = '/profile';
    }
  }, []);

  function roleFromToken(token: string): string | undefined {
    try {
      const payload = token.split('.')[1];
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return json.role;
    } catch {
      return undefined;
    }
  }

  function finish(token: string, refresh?: string) {
    localStorage.setItem('token', token);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.startsWith('/')) {
      window.location.href = next;
      return;
    }
    const role = roleFromToken(token);
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'SUPERADMIN') {
      window.location.href = '/admin';
      return;
    }
    window.location.href = '/profile';
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { setErr('Prijava nije uspjela. Provjeri podatke.'); return; }
    const data = await res.json();
    if (data.mfa_required && data.mfa_token) {
      setMfaToken(data.mfa_token);
      return;
    }
    finish(data.access_token, data.refresh_token);
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${API}/auth/mfa/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfa_token: mfaToken, code }),
    });
    if (!res.ok) { setErr('Kod nije ispravan ili je istekao.'); return; }
    const data = await res.json();
    finish(data.access_token, data.refresh_token);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0b1f] to-[#1a1535] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d3df5] to-[#d4af77] grid place-items-center text-white text-xs font-bold">B</span>
          <span className="font-display font-bold text-sm">BALKAN EVENTS</span>{process.env.NEXT_PUBLIC_ENV === "test" && <span className="ml-auto text-[10px] font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded">TEST</span>}
        </div>
        <h1 className="text-2xl font-display font-extrabold text-[#0d0b1f]">{mfaToken ? 'MFA potvrda' : 'Prijava'}</h1>
        <p className="text-gray-500 text-sm mt-1">{mfaToken ? 'Unesi TOTP ili recovery kod' : 'Dobrodošao nazad'}</p>
        {!mfaToken ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d3df5] outline-none" />
            <input type="password" required placeholder="Lozinka" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d3df5] outline-none" />
            {err && <p className="text-red-500 text-sm">{err}</p>}
            <button type="submit" className="w-full bg-[#6d3df5] hover:bg-[#7c50ff] text-white py-3 rounded-xl font-medium transition">Prijavi se</button>
          </form>
        ) : (
          <form onSubmit={confirm} className="mt-6 space-y-4">
            <input required placeholder="Kod" value={code} onChange={e => setCode(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d3df5] outline-none" />
            {err && <p className="text-red-500 text-sm">{err}</p>}
            <button type="submit" className="w-full bg-[#6d3df5] hover:bg-[#7c50ff] text-white py-3 rounded-xl font-medium transition">Potvrdi</button>
          </form>
        )}
        <p className="text-center text-sm text-gray-500 mt-6">
          Nemaš račun? <Link href="/register" className="text-[#6d3df5] font-medium">Registruj se</Link>
        </p>
      </div>
    </div>
  );
}
