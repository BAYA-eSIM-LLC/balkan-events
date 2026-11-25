'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CATEGORIES: Record<string, number> = {
  koncerti: 1, festivali: 2, sport: 3, teatar: 4, kultura: 5, nightlife: 6
};

export default function SearchPage() {
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cat = params.get('category');
    if (cat && CATEGORIES[cat]) {
      setCategoryId(CATEGORIES[cat]);
      load(CATEGORIES[cat]);
    }
  }, [params]);

  const load = async (catId?: number) => {
    setLoading(true);
    setError('');
    try {
      const urlParams = new URLSearchParams({ limit: '20' });
      if (q) urlParams.set('q', q);
      if (city) urlParams.set('city', city);
      if (catId) urlParams.set('category_id', String(catId));
      const r = await fetch(`${API}/events/search?${urlParams}`);
      if (!r.ok) throw new Error('Search failed');
      const d = await r.json();
      setResults(d.results || d || []);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const search = () => load(categoryId || undefined);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{categoryId ? Object.keys(CATEGORIES).find(k => CATEGORIES[k] === categoryId)?.replace(/^\w/, c => c.toUpperCase()) : 'Pretraga'}</h1>
        <div className="flex gap-2 mb-6">
          <input className="flex-1 border rounded-lg px-4 py-2" placeholder="Događaj, izvođač..." value={q} onChange={e => setQ(e.target.value)} />
          <button onClick={search} className="bg-purple-600 text-white px-6 py-2 rounded-lg">Pretraži</button>
        </div>
        {loading && <p className="text-gray-500">Učitavanje...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="grid gap-4">
          {results.map(e => (
            <Link key={e.id} href={`/events/${e.slug}`} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md flex gap-4">
              {e.image_url && <img src={e.image_url} alt="" className="w-24 h-24 object-cover rounded-lg" />}
              <div>
                <h2 className="font-semibold">{e.title}</h2>
                <p className="text-sm text-gray-500">{e.city} • {e.start_at ? new Date(e.start_at).toLocaleDateString('hr') : ''}</p>
              </div>
            </Link>
          ))}
          {!loading && results.length === 0 && <p className="text-gray-500">Nema rezultata.</p>}
        </div>
      </div>
    </div>
  );
}
