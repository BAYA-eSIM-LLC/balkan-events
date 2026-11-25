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
    <div className="mt-6 py-4 border-t border-b border-zinc-100">
      <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="flex flex-wrap justify-center items-center gap-4">
        {sponsors.map(s => (
          <a key={s.id} href={s.website || '#'} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-zinc-50 to-zinc-100 rounded-xl border border-zinc-200 hover:border-purple-300 hover:shadow-sm transition">
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-base font-bold text-zinc-800">{s.name}</span>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
