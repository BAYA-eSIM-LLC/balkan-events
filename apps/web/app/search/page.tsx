'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || '/api';

const CATEGORIES: Record<string, number> = {
  koncerti: 1, festivali: 2, sport: 3, teatar: 4, kultura: 5, nightlife: 6
};

function SearchContent() {
  const params = useSearchParams();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const cat = params.get('category');
    const query = params.get('q');
    if (query) setQ(query);
    if (cat && CATEGORIES[cat]) {
      setCategoryId(CATEGORIES[cat]);
      load(CATEGORIES[cat], query || undefined);
    } else if (query) {
      load(undefined, query);
    }
  }, [params]);

  const load = async (catId?: number, query?: string) => {
    setLoading(true);
    try {
      const urlParams = new URLSearchParams({ limit: '20' });
      const searchQ = query || q;
      if (searchQ) urlParams.set('q', searchQ);
      if (catId) urlParams.set('category_id', String(catId));
      const r = await fetch(`${API}/events/search?${urlParams}`);
      const d = await r.json();
      setResults(d.results || d || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{categoryId ? Object.keys(CATEGORIES).find(k => CATEGORIES[k] === categoryId)?.replace(/^\w/, c => c.toUpperCase()) : 'Pretraga'}</h1>
        <div className="flex gap-2 mb-6">
          <input className="flex-1 border rounded-lg px-4 py-2" placeholder="Događaj, izvođač..." value={q} onChange={e => setQ(e.target.value)} />
          <button onClick={() => load(categoryId || undefined)} className="bg-purple-600 text-white px-6 py-2 rounded-lg">Pretraži</button>
        </div>
        {loading && <p className="text-gray-500">Učitavanje...</p>}
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 pt-20 p-4">Učitavanje...</div>}>
      <SearchContent />
    </Suspense>
  );
}
