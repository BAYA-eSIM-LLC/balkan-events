'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <section className="relative min-h-[75vh] md:min-h-[80vh] flex items-center text-white overflow-hidden">
      <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2000&q=80" alt="Koncert" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />

      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 w-full text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">Doživi najbolje događaje na Balkanu</h1>
        <p className="mt-4 md:mt-5 text-base md:text-lg text-white/75 max-w-lg mx-auto lg:mx-0">Pronađi događaje, rezerviši svoje mjesto i kupi ulaznice jednostavno i sigurno.</p>

        <form action="/search" className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto lg:mx-0">
          <input name="q" placeholder="Traži događaj, izvođača ili grad" className="flex-1 bg-white text-zinc-900 rounded-lg px-4 py-3.5 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e11d48]" />
          <button type="submit" className="bg-[#e11d48] hover:bg-[#be123c] px-6 py-3.5 rounded-lg font-semibold text-sm transition">Pretraži</button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2 justify-center lg:justify-start">
          {['Danas', 'Ovaj vikend', 'Besplatno', 'U mojoj blizini'].map(f => (
            <Link key={f} href={`/search?filter=${encodeURIComponent(f.toLowerCase())}`} className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm bg-white/10 border border-white/20 hover:bg-white/20 transition">
              {f}
            </Link>
          ))}
        </div>

        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }} className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/15 max-w-sm mx-auto lg:mx-0">
            <p className="text-xs sm:text-sm font-medium mb-2">Prvi događaji stižu uskoro</p>
            <div className="flex gap-2">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email za obavijest" className="flex-1 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#e11d48]" />
              <button type="submit" className="bg-[#e11d48] hover:bg-[#be123c] px-3 py-2 rounded-md text-sm font-medium transition">Obavijesti</button>
            </div>
          </form>
        ) : (
          <p className="mt-8 text-sm text-emerald-300">Hvala! Javit ćemo ti se.</p>
        )}
      </div>
    </section>
  );
}
