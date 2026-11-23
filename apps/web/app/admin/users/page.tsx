'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  function load() {
    setLoading(true);
    adminFetch('/admin/users?page=1&page_size=50')
      .then(d => setUsers(d.items || d || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function toggle(u: any) {
    setBusy(u.id);
    setError(null);
    try {
      await adminFetch(`/admin/users/${u.id}/active?active=${!u.is_active}`, { method: 'PATCH' });
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Korisnici</h1>
      <p className="text-zinc-400 text-sm mb-6">Stvarni podaci iz /admin/users. Nema demo podataka.</p>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}
      {!loading && !error && users.length === 0 && <p className="text-zinc-400 text-sm">Nema korisnika.</p>}
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center text-sm">
            <div>
              <p className="font-medium">{u.email}</p>
              <p className="text-xs text-zinc-400">{u.role} · {u.is_active ? 'Aktivan' : 'Neaktivan'}</p>
            </div>
            <button
              onClick={() => toggle(u)}
              disabled={busy === u.id}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50"
            >
              {busy === u.id ? '...' : u.is_active ? 'Deaktiviraj' : 'Aktiviraj'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
