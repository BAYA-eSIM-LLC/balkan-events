'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  const load = async (p: number, append: boolean) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(p), limit: '12' });
      if (q) params.set('q', q);
      if (city) params.set('city', city);
      const r = await fetch(`${API}/events/search?${params}`);
      if (!r.ok) throw new Error('Search failed');
      const d = await r.json();
      const items = d.results || [];
      setResults(prev => {
        if (!append) return items;
        const ids = new Set(prev.map(x => x.id));
        return [...prev, ...items.filter((x: any) => !ids.has(x.id))];
      });
      setHasMore(items.length === 12);
      setPage(p);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const search = () => load(1, false);
  const more = () => load(page + 1, true);

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search events</h1>
      <div className="space-y-2 mb-4">
        <input className="border p-2 w-full" placeholder="Event, artist..." value={q} onChange={e => setQ(e.target.value)} />
        <input className="border p-2 w-full" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
        <button onClick={search} className="bg-black text-white px-4 py-2 rounded">Search</button>
      </div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <div className="space-y-2">
        {results.map(e => (
          <a key={e.id} href={`/events/${e.slug}`} className="block border rounded p-3">
            <div className="font-medium">{e.title}</div>
            <div className="text-xs text-gray-500">{e.city}, {e.country}</div>
          </a>
        ))}
      </div>
      {results.length === 0 && !loading && <p className="text-sm text-gray-500 mt-4">No results.</p>}
      {hasMore && results.length > 0 && (
        <button onClick={more} disabled={loading} className="mt-4 border px-4 py-2 rounded text-sm">
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}
