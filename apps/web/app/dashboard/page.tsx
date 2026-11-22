'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : null).then(setUser);
  }, []);

  if (!user) return <div className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-500">Prijavi se da vidiš dashboard.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display font-bold mb-2">Zdravo, {user.full_name || user.email}</h1>
      <p className="text-gray-500 mb-8">Tvoj BALKAN EVENTS dashboard</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/tickets" className="p-6 bg-gray-50 rounded-2xl border hover:border-violet-300"><h3 className="font-semibold">Moje ulaznice</h3><p className="text-sm text-gray-500 mt-1">QR kodovi i status</p></Link>
        <Link href="/profile" className="p-6 bg-gray-50 rounded-2xl border hover:border-violet-300"><h3 className="font-semibold">Profil</h3><p className="text-sm text-gray-500 mt-1">Podaci i postavke</p></Link>
        <Link href="/search" className="p-6 bg-gray-50 rounded-2xl border hover:border-violet-300"><h3 className="font-semibold">Pronađi događaj</h3><p className="text-sm text-gray-500 mt-1">Pretraga i filteri</p></Link>
      </div>
    </div>
  );
}
