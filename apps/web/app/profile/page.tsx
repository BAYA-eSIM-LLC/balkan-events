'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setError('Nisi prijavljen.'); return; }
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => setError('Greška pri učitavanju profila'));
  }, []);

  if (error) return <div className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-500">{error} <Link href="/login" className="text-violet-600">Prijava</Link></div>;
  if (!user) return <div className="max-w-2xl mx-auto px-6 py-16 text-center text-gray-400">Učitavanje...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display font-bold mb-6">Profil</h1>
      <div className="space-y-4 bg-gray-50 rounded-2xl p-6">
        <div><span className="text-sm text-gray-500">Ime</span><div className="font-medium">{user.full_name || '–'}</div></div>
        <div><span className="text-sm text-gray-500">Email</span><div className="font-medium">{user.email}</div></div>
        <div><span className="text-sm text-gray-500">Uloga</span><div className="font-medium">{user.role}</div></div>
        <div><span className="text-sm text-gray-500">Verificiran</span><div className="font-medium">{user.is_verified ? 'Da' : 'Ne'}</div></div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard" className="text-violet-600 text-sm">Dashboard</Link>
        <Link href="/tickets" className="text-violet-600 text-sm">Ulaznice</Link>
      </div>
    </div>
  );
}
