'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; full_name?: string; role?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(setUser)
      .catch(() => router.push('/login'));
  }, [router]);

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  }

  if (!user) return <p>Učitavanje...</p>;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      <p>Email: {user.email}</p>
      {user.full_name && <p>Ime: {user.full_name}</p>}
      <button onClick={logout} className="mt-4 bg-gray-200 px-4 py-2 rounded text-sm">Odjava</button>
    </div>
  );
}
