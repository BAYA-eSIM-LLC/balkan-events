'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError('Neispravni podaci'); return; }
      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      router.push('/profile');
    } catch {
      setError('Greška pri prijavi');
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prijava</h1>
      <form onSubmit={submit} className="space-y-3">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border rounded px-3 py-2" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" required className="w-full border rounded px-3 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded">Prijavi se</button>
      </form>
      <p className="text-sm mt-4 text-center"><a href="/register">Nemaš račun? Registruj se</a></p>
      <p className="text-sm text-center"><a href="/forgot-password">Zaboravljena lozinka</a></p>
    </div>
  );
}
