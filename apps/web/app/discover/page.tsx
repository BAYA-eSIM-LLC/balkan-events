'use client';

import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DiscoverPage() {
  const [data, setData] = useState<any>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const sentinel = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const load = async (p: number, append: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API}/events/discover?page=${p}&limit=12`);
      if (!r.ok) throw new Error('Failed to load');
      const d = await r.json();
      if (!append) setData(d);
      setUpcoming(prev => {
        const base = append ? prev : (d.upcoming || []);
        if (!append) return base;
        const ids = new Set(base.map((x: any) => x.id));
        return [...base, ...(d.upcoming || []).filter((x: any) => !ids.has(x.id))];
      });
      setHasMore(!!d.has_more);
      setPage(p);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => { load(1, false); }, []);

  useEffect(() => {
    if (!sentinel.current || !hasMore) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loadingRef.current) load(page + 1, true);
    }, { rootMargin: '200px' });
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [page, hasMore]);

  if (!data && loading) return <div className="p-8">Loading...</div>;
  if (error && !data) return <div className="p-8 text-red-600">{error}</div>;

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
      <Section title="Popular" items={data?.popular || []} />
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Upcoming</h2>
        {upcoming.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {upcoming.map(e => (
              <a key={e.id} href={`/events/${e.slug}`} className="border rounded p-3">
                <div className="font-medium">{e.title}</div>
                <div className="text-xs text-gray-500">{e.city}</div>
              </a>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500">No upcoming events.</p>}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {hasMore && <div ref={sentinel} className="h-8" />}
        {loading && <p className="text-sm text-gray-500 mt-2">Loading...</p>}
        {!hasMore && upcoming.length > 0 && <p className="text-xs text-gray-400 mt-2">End of list</p>}
      </section>
      <Section title="This Weekend" items={data?.this_weekend || []} />
      <Section title="Recently Added" items={data?.recently_added || []} />
    </div>
  );
}
