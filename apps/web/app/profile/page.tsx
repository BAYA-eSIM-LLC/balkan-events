'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<{ email?: string; full_name?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { router.push('/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        if (!r.ok) { router.push('/login'); return null; }
        return r.json();
      })
      .then(data => { if (data) setUser(data); })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      }).catch(() => {});
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/');
  }

  if (loading) return <p>Učitavanje...</p>;
  if (!user) return null;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profil</h1>
      <p>Email: {user.email}</p>
      {user.full_name && <p>Ime: {user.full_name}</p>}
      <button onClick={logout} className="mt-4 bg-gray-200 px-4 py-2 rounded text-sm">Odjava</button>
    </div>
  );
}
