'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { setError('Neispravni podaci'); setLoading(false); return; }
      const data = await res.json();
      localStorage.setItem('access_token', data.access_token);
      if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
      router.push('/profile');
    } catch {
      setError('Greška pri prijavi');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-display font-bold text-center mb-2">Prijava</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Dobrodošli natrag na BALKAN EVENTS</p>
        <form onSubmit={submit} className="space-y-4">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" required className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full btn-gradient text-white py-3">{loading ? 'Prijava...' : 'Prijavi se'}</Button>
        </form>
        <div className="mt-6 text-center text-sm space-y-2">
          <Link href="/register" className="text-violet-600 hover:underline">Nemaš račun? Registruj se</Link>
          <br />
          <Link href="/forgot-password" className="text-gray-500 hover:underline">Zaboravljena lozinka</Link>
        </div>
      </div>
    </div>
  );
}
