'use client';
import { useEffect, useState } from 'react';

type Sponsor = { id: number; name: string; logo_url?: string; website?: string; level?: string; placement_id?: number };

export default function Sponsors({ position = 'HOMEPAGE', eventId, title = 'Sponzori' }: { position?: string; eventId?: number; title?: string }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ position });
    if (eventId) params.set('event_id', String(eventId));
    fetch(`/api/public/sponsors?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(setSponsors)
      .catch(() => setSponsors([]));
  }, [position, eventId]);

  const trackClick = (placementId: number) => {
    fetch(`/api/sponsors/placements/${placementId}/click`, { method: 'POST' }).catch(() => {});
  };

  const handleClick = (s: Sponsor) => {
    setClicked(s.id);
    if (s.placement_id) trackClick(s.placement_id);
    setTimeout(() => setClicked(null), 300);
    if (s.website) window.open(s.website, '_blank');
  };

  if (sponsors.length === 0) return null;

  const levelColors: Record<string, string> = {
    TITLE: 'from-amber-50 via-amber-100 to-amber-50 border-amber-300',
    MAIN: 'from-purple-50 via-purple-100 to-purple-50 border-purple-300',
    GOLD: 'from-yellow-50 via-yellow-100 to-yellow-50 border-yellow-400',
    SILVER: 'from-zinc-50 via-zinc-100 to-zinc-50 border-zinc-300',
    PARTNER: 'from-blue-50 via-blue-100 to-blue-50 border-blue-300',
    MEDIA: 'from-emerald-50 via-emerald-100 to-emerald-50 border-emerald-300',
  };

  const levelBadge: Record<string, string> = {
    TITLE: 'bg-amber-500',
    MAIN: 'bg-purple-500',
    GOLD: 'bg-yellow-500',
    SILVER: 'bg-zinc-400',
    PARTNER: 'bg-blue-500',
    MEDIA: 'bg-emerald-500',
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
          <button
            key={s.id}
            onClick={() => handleClick(s)}
            onMouseEnter={() => setHovered(s.id)}
            onMouseLeave={() => setHovered(null)}
            className={`relative group flex items-center gap-3 px-6 py-4 bg-gradient-to-br ${levelColors[s.level || 'PARTNER'] || levelColors.PARTNER} rounded-2xl border-2 shadow-sm transition-all duration-300 ${
              hovered === s.id ? 'scale-105 shadow-lg -translate-y-1' : ''
            } ${clicked === s.id ? 'scale-95' : ''}`}
          >
            {s.level && (
              <span className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${levelBadge[s.level] || 'bg-zinc-400'} shadow-sm`} />
            )}
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} className="h-12 w-auto max-w-[140px] object-contain" />
            ) : (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg font-bold text-zinc-600 transition-transform ${hovered === s.id ? 'rotate-6' : ''}`}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-zinc-800">{s.name}</span>
              </div>
            )}
            {hovered === s.id && s.website && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 whitespace-nowrap">
                Klikni za više
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
