'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Slide = { desktop: string; mobile: string; alt: string; title: string; subtitle?: string };
const FALLBACK: Slide[] = [
  { desktop: '/hero/concert1.jpg', mobile: '/hero/concert-mobile.jpg', alt: 'Concert', title: 'Najveći događaji na Balkanu' },
];

export default function HeroBanner() {
  const [slides, setSlides] = useState<Slide[]>(FALLBACK);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Prefer CMS published slides. No fake content if empty.
    fetch('/api/public/homepage')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.hero?.length) {
          setSlides(data.hero.map((s: any) => ({
            desktop: s.image_url,
            mobile: s.mobile_image_url || s.image_url,
            alt: s.title || 'Hero',
            title: s.title || 'BALKAN EVENTS',
            subtitle: s.subtitle,
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setCurrent(p => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] || FALLBACK[0];

  return (
    <section className="relative min-h-[78vh] md:min-h-[88vh] flex items-end md:items-center text-white overflow-hidden bg-black">
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <picture>
            <source media="(min-width: 768px)" srcSet={s.desktop} />
            <img src={s.mobile} alt={s.alt} className="absolute inset-0 w-full h-full object-cover object-center" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b1f] via-black/35 to-black/15 md:bg-gradient-to-r md:from-[#0b0b1f]/75 md:via-black/25 md:to-transparent" />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24 w-full z-10">
        <div className="max-w-lg">
          <p className="text-[11px] sm:text-xs tracking-[0.25em] text-purple-300 font-semibold mb-2">DISCOVER. EXPERIENCE. CONNECT.</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.02]">
            {slide.title || 'Najveći događaji na Balkanu'}
          </h1>
          {slide.subtitle && <p className="mt-4 text-sm sm:text-base text-white/85 max-w-md">{slide.subtitle}</p>}

          <form action="/search" className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input name="q" placeholder="Pretraži događaje, izvođače ili gradove..." className="w-full bg-white text-zinc-900 rounded-xl pl-9 pr-3 py-3.5 text-sm focus:outline-none shadow-lg" />
            </div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-6 py-3.5 rounded-xl font-semibold text-sm shadow-lg">Pretraži</button>
          </form>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition ${i === current ? 'bg-white' : 'bg-white/40'}`} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
}
