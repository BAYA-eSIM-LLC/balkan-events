'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const search = async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (country) params.set('country', country);
    const r = await fetch(`${API}/events/search?${params}`);
    const d = await r.json();
    setResults(d.results || []);
  };

  const onType = async (v: string) => {
    setQ(v);
    if (v.length >= 2) {
      const r = await fetch(`${API}/events/autocomplete?q=${encodeURIComponent(v)}`);
      setSuggestions(await r.json());
    } else setSuggestions([]);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search events</h1>
      <div className="space-y-2 mb-4">
        <input className="border p-2 w-full" placeholder="Event, artist..." value={q} onChange={e => onType(e.target.value)} />
        {suggestions.length > 0 && (
          <ul className="border rounded text-sm">
            {suggestions.map((s: any) => <li key={s.slug} className="p-2 hover:bg-gray-50">{s.title} — {s.city}</li>)}
          </ul>
        )}
        <div className="flex gap-2">
          <input className="border p-2 flex-1" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
          <input className="border p-2 flex-1" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} />
        </div>
        <button onClick={search} className="bg-black text-white px-4 py-2 rounded">Search</button>
      </div>
      <div className="space-y-2">
        {results.map(e => (
          <a key={e.id} href={`/events/${e.slug}`} className="block border rounded p-3">
            <div className="font-medium">{e.title}</div>
            <div className="text-xs text-gray-500">{e.city}, {e.country}</div>
          </a>
        ))}
        {results.length === 0 && <p className="text-sm text-gray-500">No results. Try another city or remove filters.</p>}
      </div>
    </div>
  );
}
