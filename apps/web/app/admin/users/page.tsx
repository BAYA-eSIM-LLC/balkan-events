'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/admin/users?page=1&page_size=20')
      .then(d => setUsers(d.items || d || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Korisnici</h1>
      <p className="text-zinc-400 text-sm mb-6">Upravljanje korisnicima i ulogama</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm">{error}</div>}
      {!loading && !error && users.length === 0 && <p className="text-zinc-400 text-sm">Nema korisnika ili API nije dostupan.</p>}
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between text-sm">
            <div>
              <p className="font-medium">{u.email}</p>
              <p className="text-xs text-zinc-400">{u.role} · {u.is_active ? 'Aktivan' : 'Neaktivan'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
