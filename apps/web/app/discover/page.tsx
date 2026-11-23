'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DiscoverPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/events/discover`).then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const Section = ({ title, items }: { title: string; items: any[] }) => (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {items?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((e: any) => (
            <a key={e.id} href={`/events/${e.slug}`} className="border rounded p-3 hover:shadow">
              <div className="font-medium">{e.title}</div>
              <div className="text-xs text-gray-500">{e.city} · {e.start_at}</div>
            </a>
          ))}
        </div>
      ) : <p className="text-sm text-gray-500">No events yet.</p>}
    </section>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Discover</h1>
      <Section title="Popular" items={data.popular} />
      <Section title="Upcoming" items={data.upcoming} />
      <Section title="This Weekend" items={data.this_weekend} />
      <Section title="Recently Added" items={data.recently_added} />
      <section>
        <h2 className="text-xl font-semibold mb-3">Top Cities</h2>
        <div className="flex flex-wrap gap-2">
          {data.top_cities?.map((c: any) => <span key={c.city} className="border rounded px-3 py-1 text-sm">{c.city} ({c.count})</span>)}
          {!data.top_cities?.length && <p className="text-sm text-gray-500">No cities yet.</p>}
        </div>
      </section>
    </div>
  );
}
