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

  const levelColors: Record<string, string> = {
    TITLE: 'from-amber-50 to-amber-100 border-amber-200',
    MAIN: 'from-purple-50 to-purple-100 border-purple-200',
    GOLD: 'from-yellow-50 to-yellow-100 border-yellow-300',
    SILVER: 'from-zinc-50 to-zinc-100 border-zinc-300',
    PARTNER: 'from-blue-50 to-blue-100 border-blue-200',
    MEDIA: 'from-emerald-50 to-emerald-100 border-emerald-200',
  };

  return (
    <div className="mt-6 mb-6">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-200" />
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.2em]">{title}</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-200" />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-3">
        {sponsors.map(s => (
          <a
            key={s.id}
            href={s.website || '#'}
            target="_blank"
            rel="noreferrer"
            className={`group flex items-center gap-3 px-6 py-4 bg-gradient-to-br ${levelColors[s.level || 'PARTNER'] || levelColors.PARTNER} rounded-2xl border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200`}
          >
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-12 w-auto max-w-[140px] object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center text-lg font-bold text-zinc-600">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-zinc-800 group-hover:text-zinc-900">{s.name}</span>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
