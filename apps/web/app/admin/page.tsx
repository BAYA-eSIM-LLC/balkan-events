'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminPage() {
  const [dash, setDash] = useState<any>(null);
  const [users, setUsers] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setError('Potrebna administratorska prijava.'); return; }
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${API}/admin/dashboard`, { headers: h }).then(r => r.ok ? r.json() : null).then(setDash);
    fetch(`${API}/admin/users?page=1&page_size=10`, { headers: h }).then(r => r.ok ? r.json() : null).then(setUsers);
    fetch(`${API}/admin/organizations/pending`, { headers: h }).then(r => r.ok ? r.json() : []).then(setPending);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold mb-2">Admin panel</h1>
      <p className="text-gray-500 mb-8">Koristi postojeće administratorske ovlasti i API-je.</p>
      {error && <p className="text-red-600">{error}</p>}

      {dash && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {['users','organizations','events','published_events','pending_verifications','open_support_tickets'].map(k => (
            <div key={k} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold">{dash[k]}</div>
              <div className="text-xs text-gray-500 capitalize">{k.replace(/_/g,' ')}</div>
            </div>
          ))}
        </div>
      )}

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Organizacije na čekanju</h2>
        {pending.length === 0 ? <p className="text-gray-400">Nema na čekanju.</p> : pending.map(o => (
          <div key={o.id} className="border rounded-xl px-4 py-3 mb-2">{o.name} – {o.verification_status}</div>
        ))}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Korisnici (prva stranica)</h2>
        {users?.items?.length ? users.items.map((u: any) => (
          <div key={u.id} className="flex justify-between border-b py-2 text-sm">
            <span>{u.email}</span>
            <span className="text-gray-500">{u.role}</span>
          </div>
        )) : <p className="text-gray-400">Nema podataka ili nema ovlasti.</p>}
      </section>
    </div>
  );
}
