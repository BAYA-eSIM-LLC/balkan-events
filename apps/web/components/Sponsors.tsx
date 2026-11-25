'use client';
import { useEffect, useState, useRef } from 'react';

type Sponsor = { id: number; name: string; logo_url?: string; website?: string; level?: string; placement_id?: number };

export default function Sponsors({ position = 'HOMEPAGE', eventId, title = 'Sponzori' }: { position?: string; eventId?: number; title?: string }) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
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
    setTimeout(() => setClicked(null), 200);
    if (s.website) window.open(s.website, '_blank');
  };

  const navigate = (dir: 'left' | 'right') => {
    if (isAnimating) return;
    if (dir === 'left' && currentIndex >= sponsors.length - 1) return;
    if (dir === 'right' && currentIndex <= 0) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex(prev => dir === 'left' ? prev + 1 : prev - 1);
      setIsAnimating(false);
      setDirection(null);
    }, 300);
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
    navigate(distance > 0 ? 'left' : 'right');
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
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex justify-center">
          {sponsors.map((s, i) => (
            <div
              key={s.id}
              className={`absolute w-full flex justify-center px-4 transition-all duration-300 ease-out ${
                i === currentIndex
                  ? 'opacity-100 translate-x-0 scale-100 relative'
                  : i < currentIndex
                  ? 'opacity-0 -translate-x-full scale-95'
                  : 'opacity-0 translate-x-full scale-95'
              } ${direction === 'left' && i === currentIndex ? 'animate-slide-out-left' : ''} ${
                direction === 'right' && i === currentIndex ? 'animate-slide-out-right' : ''
              }`}
              style={{ zIndex: i === currentIndex ? 10 : 0 }}
            >
              <button
                onClick={() => handleClick(s)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                className={`relative group flex items-center gap-3 px-8 py-5 bg-gradient-to-br ${levelColors[s.level || 'PARTNER'] || levelColors.PARTNER} rounded-2xl border-2 shadow-sm transition-all duration-200 ${
                  hovered === s.id ? 'scale-105 shadow-xl' : ''
                } ${clicked === s.id ? 'scale-90' : ''}`}
              >
                {s.level && (
                  <span className={`absolute -top-2 -right-2 w-3 h-3 rounded-full ${levelBadge[s.level] || 'bg-zinc-400'} shadow-sm animate-pulse`} />
                )}
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-14 w-auto max-w-[160px] object-contain" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl font-bold text-zinc-600 transition-all duration-300 ${hovered === s.id ? 'rotate-12 scale-110' : ''}`}>
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
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => navigate('right')}
            disabled={currentIndex === 0}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              currentIndex === 0 ? 'text-zinc-300' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            ←
          </button>
          <div className="flex gap-2">
            {sponsors.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentIndex ? 'left' : 'right');
                  setCurrentIndex(i);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'bg-zinc-600 w-6' : 'bg-zinc-300 w-2 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => navigate('left')}
            disabled={currentIndex === sponsors.length - 1}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              currentIndex === sponsors.length - 1 ? 'text-zinc-300' : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
