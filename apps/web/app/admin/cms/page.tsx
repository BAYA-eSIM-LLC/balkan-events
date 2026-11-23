'use client';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

export default function AdminCMS() {
  const [slides, setSlides] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminFetch('/admin/cms/hero').catch(() => []),
      adminFetch('/admin/cms/sections').catch(() => []),
    ]).then(([h, s]) => {
      setSlides(Array.isArray(h) ? h : []);
      setSections(Array.isArray(s) ? s : []);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">CMS – Homepage</h1>
      <p className="text-zinc-400 text-sm mb-6">Hero slideshow, sekcije, redoslijed, aktivacija</p>

      {loading && <p className="text-zinc-400">Učitavanje...</p>}
      {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl p-4 text-sm mb-4">{error}</div>}

      <div className="mb-8">
        <h2 className="font-semibold mb-3">Hero slajdovi</h2>
        {slides.length === 0 && !loading && <p className="text-zinc-400 text-sm">Nema slajdova ili API nije dostupan.</p>}
        <div className="space-y-2">
          {slides.map(s => (
            <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center text-sm">
              <div>
                <p className="font-medium">{s.title || 'Bez naslova'}</p>
                <p className="text-xs text-zinc-400">{s.category || '—'} · red {s.sort_order} · {s.duration_seconds}s · {s.is_active ? 'Aktivan' : 'Neaktivan'}</p>
              </div>
              <span className="text-xs text-zinc-500">{s.image_url?.slice(0, 40)}...</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Sekcije homepagea</h2>
        {sections.length === 0 && !loading && <p className="text-zinc-400 text-sm">Nema sekcija.</p>}
        <div className="space-y-2">
          {sections.map(sec => (
            <div key={sec.id} className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm">
              <p className="font-medium">{sec.title || sec.key}</p>
              <p className="text-xs text-zinc-400">key: {sec.key} · red {sec.sort_order} · {sec.is_active ? 'Aktivna' : 'Neaktivna'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-xs text-zinc-500 border-t border-white/10 pt-4">
        Javni endpoint: <code className="text-purple-300">/public/homepage</code> — koriste ga web i buduće mobilne aplikacije.
      </div>
    </div>
  );
}
