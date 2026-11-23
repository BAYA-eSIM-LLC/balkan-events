'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');

  const load = (search = '') => {
    setLoading(true);
    const q = search ? `?code=${encodeURIComponent(search)}` : '';
    adminFetch(`/admin/tickets${q}`)
      .then(d => setTickets(d.items || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Ulaznice</h1>
      <p className="text-zinc-400 text-sm mb-4">Stvarni podaci. QR se ne može mijenjati.</p>
      <div className="flex gap-2 mb-4">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Pretraga po kodu"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        />
        <button onClick={() => load(code)} className="bg-purple-600 px-4 py-2 rounded-lg text-sm">Traži</button>
      </div>
      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 text-amber-200 p-3 rounded-xl text-sm mb-4">{error}</div>}
      {!loading && tickets.length === 0 && <p className="text-zinc-500 text-sm">Nema ulaznica.</p>}
      {tickets.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-zinc-400 border-b border-white/10">
                <th className="pb-2">ID</th>
                <th className="pb-2">Kod</th>
                <th className="pb-2">Tip</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Used</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b border-white/5">
                  <td className="py-2">{t.id}</td>
                  <td>{t.code}</td>
                  <td>{t.ticket_type}</td>
                  <td>{t.status}</td>
                  <td>{t.is_used ? 'Da' : 'Ne'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
