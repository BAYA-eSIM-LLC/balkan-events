'use client';
import Link from 'next/link';

export default function HeroBanner() {
  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-end md:items-center text-white overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2400&q=90" 
        alt="Koncert" 
        className="absolute inset-0 w-full h-full object-cover object-center scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b1f] via-black/30 to-black/20 md:bg-gradient-to-r md:from-[#0b0b1f]/80 md:via-black/20 md:to-transparent" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24 w-full">
        <div className="max-w-lg">
          <p className="text-[11px] sm:text-xs tracking-[0.25em] text-purple-300 font-semibold mb-2">DISCOVER. EXPERIENCE. CONNECT.</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.02]">
            Najveći događaji<br />na Balkanu
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-md">
            Koncerti, festivali, sport, teatar i još mnogo toga. Pronađi, rezerviši i doživi najbolje događaje u regionu.
          </p>

          <form action="/search" className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input name="q" placeholder="Pretraži događaje, izvođače ili gradove..." className="w-full bg-white text-zinc-900 rounded-xl pl-9 pr-3 py-3.5 text-sm focus:outline-none shadow-lg" />
            </div>
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-6 py-3.5 rounded-xl font-semibold text-sm shadow-lg">Pretraži</button>
          </form>
        </div>
      </div>
    </section>
  );
}
