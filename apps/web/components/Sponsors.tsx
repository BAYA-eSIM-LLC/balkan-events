'use client';
import { useEffect, useState, useRef } from 'react';

type Sponsor = { id: number; name: string; logo_url?: string; website?: string; level?: string; placement_id?: number };

export default function Sponsors({ position = 'HOMEPAGE', eventId, title = 'Sponzori' }: { position?: string; eventId?: number; title?: string }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

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

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) < minSwipeDistance) return;
    if (distance > 0 && currentIndex < sponsors.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (distance < 0 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
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

      <div
        className="overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {sponsors.map(s => (
            <div key={s.id} className="w-full flex-shrink-0 flex justify-center px-4">
              <button
                onClick={() => handleClick(s)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative group flex items-center gap-3 px-8 py-5 bg-gradient-to-br ${levelColors[s.level || 'PARTNER'] || levelColors.PARTNER} rounded-2xl border-2 shadow-sm transition-all duration-300 ${
                  hovered === s.id ? 'scale-105 shadow-lg' : ''
                } ${clicked === s.id ? 'scale-95' : ''}`}
              >
                {s.level && (
                  <span className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${levelBadge[s.level] || 'bg-zinc-400'} shadow-sm`} />
                )}
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-14 w-auto max-w-[160px] object-contain" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl font-bold text-zinc-600 transition-transform ${hovered === s.id ? 'rotate-6' : ''}`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-base font-semibold text-zinc-800">{s.name}</span>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {sponsors.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {sponsors.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-zinc-600 w-4' : 'bg-zinc-300'}`}
            />
          ))}
        </div>
      )}

      {sponsors.length > 1 && (
        <p className="text-center text-[10px] text-zinc-400 mt-2">← Povuci za više →</p>
      )}
    </div>
  );
}
