'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function OrganizerPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [dash, setDash] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setError('Prijavi se kao organizator.'); return; }
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${API}/organizer/organizations`, { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then(setOrgs)
      .catch(() => setError('API nedostupan'));
    fetch(`${API}/organizer/events`, { headers: h })
      .then(r => r.ok ? r.json() : [])
      .then(setEvents);
  }, []);

  async function loadDash(orgId: number) {
    const token = localStorage.getItem('access_token');
    const r = await fetch(`${API}/organizer/dashboard?org_id=${orgId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) setDash(await r.json());
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold mb-2">Organizatorski portal</h1>
      <p className="text-gray-500 mb-8">Upravljanje organizacijama i događajima putem postojećeg API-ja.</p>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Moje organizacije</h2>
        {orgs.length === 0 ? <p className="text-gray-400">Nema organizacija.</p> : (
          <div className="grid sm:grid-cols-2 gap-4">
            {orgs.map(o => (
              <div key={o.id} className="border rounded-2xl p-5">
                <h3 className="font-semibold">{o.name}</h3>
                <p className="text-sm text-gray-500">{o.verification_status}</p>
                <Button size="sm" className="mt-3" onClick={() => loadDash(o.id)}>Dashboard</Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {dash && (
        <section className="mb-10 bg-gray-50 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div><div className="text-2xl font-bold">{dash.total_events}</div><div className="text-xs text-gray-500">Događaji</div></div>
            <div><div className="text-2xl font-bold">{dash.members}</div><div className="text-xs text-gray-500">Članovi</div></div>
            <div><div className="text-2xl font-bold">{dash.favorites}</div><div className="text-xs text-gray-500">Favoriti</div></div>
            <div><div className="text-sm text-amber-600">{dash.finance?.message || 'Finansije nedostupne'}</div></div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Moji događaji</h2>
        {events.length === 0 ? <p className="text-gray-400">Nema događaja.</p> : (
          <div className="space-y-3">
            {events.map(e => (
              <div key={e.id} className="flex justify-between items-center border rounded-xl px-4 py-3">
                <div>
                  <div className="font-medium">{e.title}</div>
                  <div className="text-sm text-gray-500">{e.status}</div>
                </div>
                <Link href={`/events/${e.slug}`} className="text-violet-600 text-sm">Pregled</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
