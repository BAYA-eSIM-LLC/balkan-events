'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <section className="relative min-h-[85vh] flex items-center text-white overflow-hidden">
      <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2000&q=80" alt="Koncert" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />

      <div className="relative max-w-3xl mx-auto px-6 py-20 w-full text-center lg:text-left">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">Doživi najbolje događaje na Balkanu</h1>
        <p className="mt-5 text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">Pronađi događaje, rezerviši svoje mjesto i kupi ulaznice jednostavno i sigurno.</p>

        <form action="/search" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto lg:mx-0">
          <input name="q" placeholder="Traži događaj, izvođača ili grad" className="flex-1 bg-white text-zinc-900 rounded-lg px-5 py-4 text-base placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#e11d48]" />
          <button type="submit" className="bg-[#e11d48] hover:bg-[#be123c] px-8 py-4 rounded-lg font-semibold transition">Pretraži</button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 justify-center lg:justify-start">
          {['Danas', 'Ovaj vikend', 'Besplatno', 'U mojoj blizini'].map(f => (
            <Link key={f} href={`/search?filter=${encodeURIComponent(f.toLowerCase())}`} className="px-4 py-2 rounded-full text-sm bg-white/10 border border-white/20 hover:bg-white/20 transition">
              {f}
            </Link>
          ))}
        </div>

        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }} className="mt-10 bg-white/10 backdrop-blur rounded-xl p-5 border border-white/15 max-w-md mx-auto lg:mx-0">
            <p className="text-sm font-medium mb-3">Prvi događaji stižu uskoro. Ostavi email za obavijest.</p>
            <div className="flex gap-2">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tvoj@email.com" className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#e11d48]" />
              <button type="submit" className="bg-[#e11d48] hover:bg-[#be123c] px-4 py-2.5 rounded-lg text-sm font-medium transition">Obavijesti me</button>
            </div>
          </form>
        ) : (
          <p className="mt-10 text-sm text-emerald-300">Hvala! Javit ćemo ti se čim događaji budu dostupni.</p>
        )}
      </div>
    </section>
  );
}
