'use client';
import { useEffect, useState } from 'react';

type Sponsor = { id: number; name: string; logo_url?: string; website?: string; level?: string };

export default function Sponsors({ position = 'HOMEPAGE', eventId, title = 'Sponzori' }: { position?: string; eventId?: number; title?: string }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    const params = new URLSearchParams({ position });
    if (eventId) params.set('event_id', String(eventId));
    fetch(`/api/public/sponsors?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(setSponsors)
      .catch(() => setSponsors([]));
  }, [position, eventId]);

  if (sponsors.length === 0) return null;

  return (
    <section className="py-8 bg-white border-t border-zinc-100">
      <div className="max-w-5xl mx-auto px-5">
        <p className="text-center text-xs text-zinc-500 uppercase tracking-widest mb-4">{title}</p>
        <div className="flex flex-wrap justify-center items-center gap-6">
          {sponsors.map(s => (
            <a key={s.id} href={s.website || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="h-8 w-auto object-contain" />
              ) : (
                <span className="text-sm font-semibold text-zinc-800">{s.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
