'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      if (!res.ok) { setError('Registracija nije uspjela'); return; }
      router.push('/login');
    } catch {
      setError('Greška pri registraciji');
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registracija</h1>
      <form onSubmit={submit} className="space-y-3">
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ime i prezime" className="w-full border rounded px-3 py-2" />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full border rounded px-3 py-2" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Lozinka" required className="w-full border rounded px-3 py-2" />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded">Registruj se</button>
      </form>
    </div>
  );
}
