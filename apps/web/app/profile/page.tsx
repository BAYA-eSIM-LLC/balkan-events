'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setErr('Nisi prijavljen'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : Promise.reject()).then(setUser).catch(() => setErr('Ne mogu učitati profil'));
  }, []);

  if (err) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">{err}</p>
        <Link href="/login" className="mt-4 inline-block text-[#7047EB]">Prijavi se</Link>
      </div>
    </div>
  );
  if (!user) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">Učitavanje...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-[#0b1020] text-white py-12">
        <div className="max-w-3xl mx-auto px-5">
          <h1 className="text-3xl font-display font-semibold">Moj profil</h1>
          <p className="text-white/70 mt-1">{user.email}</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-5 py-8 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <p className="text-sm text-gray-500">Ime</p>
          <p className="font-medium">{user.full_name || user.name || '—'}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <Link href="/tickets" className="block bg-white rounded-2xl p-6 shadow-sm border border-black/5 hover:border-[#7047EB]/30">
          <p className="font-medium">Moje ulaznice</p>
          <p className="text-sm text-gray-500 mt-1">Pregledaj kupljene ulaznice</p>
        </Link>
      </div>
    </div>
  );
}
