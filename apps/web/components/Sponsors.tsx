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
    <section className="py-10 bg-zinc-50">
      <div className="max-w-5xl mx-auto px-5">
        <p className="text-center text-xs text-zinc-400 uppercase tracking-wider mb-6">{title}</p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {sponsors.map(s => (
            <a key={s.id} href={s.website || '#'} target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="h-12 w-auto object-contain" />
              ) : (
                <span className="text-sm font-medium text-zinc-600">{s.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
