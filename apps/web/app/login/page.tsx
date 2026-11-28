'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { setErr('Prijava nije uspjela. Provjeri podatke.'); return; }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    window.location.href = '/profile';
  }

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-gradient-to-br from-[#0d0b1f] to-[#1a1535] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d3df5] to-[#d4af77] grid place-items-center text-white text-xs font-bold">B</span>
          <span className="font-display font-bold text-sm">BALKAN EVENTS</span>
        </div>
        <h1 className="text-2xl font-display font-extrabold text-[#0d0b1f]">Prijava</h1>
        <p className="text-gray-500 text-sm mt-1">Dobrodošao nazad</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d3df5] outline-none" />
          <input type="password" required placeholder="Lozinka" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#6d3df5] outline-none" />
          {err && <p className="text-red-500 text-sm">{err}</p>}
          <button type="submit" className="w-full bg-[#6d3df5] hover:bg-[#7c50ff] text-white py-3 rounded-xl font-medium transition">Prijavi se</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Nemaš račun? <Link href="/register" className="text-[#6d3df5] font-medium">Registruj se</Link>
        </p>
      </div>
    </div>
  );
}
