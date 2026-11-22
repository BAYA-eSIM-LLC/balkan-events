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
    if (!res.ok) { setErr('Prijava nije uspjela'); return; }
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    window.location.href = '/profile';
  }

  return (
    <div className="min-h-screen bg-[#0b1020] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
        <h1 className="text-3xl font-display font-semibold text-[#0b1020]">Prijava</h1>
        <p className="text-gray-500 mt-2">Dobrodošao nazad na BALKAN EVENTS</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#7047EB] outline-none" />
          <input type="password" required placeholder="Lozinka" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#7047EB] outline-none" />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button type="submit" className="w-full bg-gradient-to-r from-[#7047EB] to-[#9B6CFF] text-white py-3 rounded-xl font-medium">Prijavi se</button>
        </form>
        <p className="mt-6 text-sm text-center text-gray-500">
          Nemaš račun? <Link href="/register" className="text-[#7047EB] font-medium">Registruj se</Link>
        </p>
      </div>
    </div>
  );
}
