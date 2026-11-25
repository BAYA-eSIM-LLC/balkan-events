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
    <section className="relative min-h-[85vh] md:min-h-[92vh] flex items-end md:items-center text-white overflow-hidden bg-black">
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <picture>
            <source media="(min-width: 768px)" srcSet={s.desktop} />
            <img src={s.mobile} alt={s.alt} className="absolute inset-0 w-full h-full object-cover object-center scale-105" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-32 w-full z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-white/90">Uživo na Balkanu</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight">
            {slide.title || 'Najveći događaji na Balkanu'}
          </h1>
          
          {slide.subtitle && (
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-lg leading-relaxed">{slide.subtitle}</p>
          )}

          <form action="/search" className="mt-8 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                name="q" 
                placeholder="Pretraži događaje, izvođače, gradove..." 
                className="w-full bg-white/95 backdrop-blur text-zinc-900 rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xl"
              />
            </div>
            <button type="submit" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 px-8 py-4 rounded-2xl font-bold text-base shadow-2xl shadow-purple-500/30 transition-all hover:scale-105">
              Pretraži
            </button>
          </form>

          <div className="mt-8 flex items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Sigurna kupovina
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              QR ulaznice
            </span>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrent(i)} 
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-8' : 'bg-white/40 w-1.5 hover:bg-white/60'}`} 
              aria-label={`Slide ${i + 1}`} 
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
