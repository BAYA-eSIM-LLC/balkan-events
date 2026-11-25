'use client';
import { useState, useEffect } from 'react';

type Slide = { desktop: string; mobile: string; alt: string; title: string; subtitle?: string };
const FALLBACK: Slide[] = [
  { 
    desktop: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2000&q=80', 
    mobile: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80', 
    alt: 'Concert', 
    title: 'Doživi najbolje događaje na Balkanu.' 
  },
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
            title: s.title || 'Doživi najbolje događaje na Balkanu.',
            subtitle: s.subtitle,
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[current] || FALLBACK[0];

  return (
    <section className="relative min-h-[92vh] flex items-center text-white overflow-hidden bg-[#10152B]">
      {slides.map((s, i) => (
        <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}>
          <img src={s.desktop} alt={s.alt} className="absolute inset-0 w-full h-full object-cover scale-105" loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "low"} decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10152B] via-[#10152B]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10152B] via-transparent to-[#10152B]/40" />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 w-full z-10 pt-20 pb-32">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 max-w-xl">
            <p className="text-[11px] tracking-[0.28em] text-[#A78BFA] font-semibold mb-4 uppercase">Koncerti · Festivali · Sport · Kultura · Noćni život</p>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
              Doživi najbolje<br />
              <span className="text-white">događaje </span>
              <span className="bg-gradient-to-r from-[#FF6B9D] to-[#A020F0] bg-clip-text text-transparent">na Balkanu.</span>
            </h1>
            
            <p className="mt-5 text-base sm:text-lg text-white/75 max-w-md leading-relaxed">
              Koncerti, festivali, sport, teatar i još mnogo toga — na jednom mjestu.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/search" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#A020F0] hover:opacity-95 hover:opacity-95 px-6 py-3.5 rounded-full font-semibold text-sm transition-all duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Otkrij događaje →
              </a>
              <a href="#how" className="inline-flex items-center gap-2 border border-white/25 hover:bg-white/10 px-6 py-3.5 rounded-full font-medium text-sm transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Kako funkcioniše
              </a>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="hidden lg:block relative">
            <div className="w-[280px] h-[560px] bg-zinc-900 rounded-[40px] border-4 border-zinc-700 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-800 rounded-b-2xl z-10" />
              <img src={slide.desktop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#10152B]/60 via-transparent to-[#10152B]" />
              <div className="relative p-6 pt-10 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#A020F0] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  </span>
                  <span className="text-xs font-bold">BALKAN EVENTS</span>
                </div>
                <p className="text-lg font-black leading-tight">Doživi najbolje događaje na Balkanu.</p>
                <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-2 text-xs text-white/70">Pretraži događaje...</div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {['🎵','🎪','⚽','🎭'].map(i => <div key={i} className="aspect-square bg-white/10 rounded-xl flex items-center justify-center text-lg">{i}</div>)}
                </div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-[#7C3AED]/20 to-[#FF6B9D]/20 blur-3xl -z-10 rounded-full" />
          </div>
        </div>

        <form action="/search" className="mt-10 max-w-3xl">
          <div className="flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 border-b sm:border-b-0 sm:border-r border-zinc-200">
              <svg className="w-5 h-5 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input name="q" placeholder="Pretraži događaje, izvođače, gradove..." className="flex-1 text-zinc-900 text-sm outline-none placeholder:text-zinc-400" />
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 text-sm text-zinc-500 border-r border-zinc-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Svi datumi
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 text-sm text-zinc-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Svi gradovi
            </div>
            <button type="submit" className="m-1.5 bg-gradient-to-r from-[#7C3AED] to-[#A020F0] text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-95 hover:shadow-lg transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Pretraži
            </button>
          </div>
        </form>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`h-1 rounded-full transition-all ${i === current ? 'bg-white w-8' : 'bg-white/40 w-2'}`} />
          ))}
        </div>
      )}
    </section>
  );
}
