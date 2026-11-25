'use client';
import { useEffect, useState } from 'react';

const API = '/api';

type Sponsor = { id: number; name: string; level?: string; status?: string; logo_url?: string; website?: string };

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [form, setForm] = useState({ name: '', level: 'GOLD', logo_url: '', website: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const token = () => localStorage.getItem('token') || '';

  const load = async () => {
    const r = await fetch(`${API}/admin/sponsors`, { headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) setSponsors(await r.json());
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name) return;
    setLoading(true);
    const r = await fetch(`${API}/admin/sponsors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ name: form.name, level: form.level, logo_url: form.logo_url || null, website: form.website || null }),
    });
    const d = await r.json();
    setLoading(false);
    if (r.ok) {
      setMsg(`Sponzor ${d.name} kreiran`);
      setForm({ name: '', level: 'GOLD', logo_url: '', website: '' });
      load();
    } else setMsg(d.detail || 'Greška');
  };

  const setStatus = async (id: number, status: string) => {
    await fetch(`${API}/admin/sponsors/${id}?status=${status}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}` },
    });
    load();
  };

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Sponzori</h1>

      <div className="bg-white border rounded-xl p-4 mb-6">
        <h2 className="font-semibold mb-3">Dodaj sponzora</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <input className="border rounded-lg px-3 py-2" placeholder="Naziv" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <select className="border rounded-lg px-3 py-2" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
            <option value="TITLE">Title</option>
            <option value="MAIN">Main</option>
            <option value="GOLD">Gold</option>
            <option value="SILVER">Silver</option>
            <option value="PARTNER">Partner</option>
            <option value="MEDIA">Media</option>
          </select>
          <input className="border rounded-lg px-3 py-2" placeholder="Logo URL" value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} />
          <input className="border rounded-lg px-3 py-2" placeholder="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
        </div>
        <button onClick={create} disabled={loading} className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">{loading ? '...' : 'Dodaj'}</button>
        {msg && <p className="mt-2 text-sm text-zinc-600">{msg}</p>}
      </div>

      <div className="space-y-2">
        {sponsors.map(s => (
          <div key={s.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {s.logo_url && <img src={s.logo_url} alt="" className="h-8 w-auto" />}
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-zinc-500">{s.level} · {s.status}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {s.status !== 'ACTIVE' && <button onClick={() => setStatus(s.id, 'ACTIVE')} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">Aktiviraj</button>}
              {s.status === 'ACTIVE' && <button onClick={() => setStatus(s.id, 'INACTIVE')} className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded">Deaktiviraj</button>}
            </div>
          </div>
        ))}
        {sponsors.length === 0 && <p className="text-zinc-500 text-sm">Nema sponzora.</p>}
      </div>
    </div>
  );
}
