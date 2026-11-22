'use client';
import { useEffect, useState } from 'react';

export default function Admin() {
  const [dash, setDash] = useState<any>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/admin/dashboard`, { headers: h })
      .then(r => { if (r.status === 404) setMissing(true); return r.ok ? r.json() : null; })
      .then(setDash);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="bg-[#0b1020] text-white py-12">
        <div className="max-w-5xl mx-auto px-5">
          <h1 className="text-3xl font-display font-semibold">Administracija</h1>
          <p className="text-white/70 mt-1">Upravljanje platformom</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-5 py-8">
        {missing && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
            <p className="font-medium">Admin API nije deployan</p>
            <p className="text-sm mt-1">Endpoint /admin/dashboard vraća 404. Funkcije će se aktivirati kada backend bude ažuriran.</p>
          </div>
        )}
        {dash && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-sm text-gray-500">Korisnici</p><p className="text-2xl font-semibold">{dash.users ?? '—'}</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-sm text-gray-500">Organizacije</p><p className="text-2xl font-semibold">{dash.organizations ?? '—'}</p></div>
            <div className="bg-white rounded-2xl p-6 shadow-sm"><p className="text-sm text-gray-500">Događaji</p><p className="text-2xl font-semibold">{dash.events ?? '—'}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
