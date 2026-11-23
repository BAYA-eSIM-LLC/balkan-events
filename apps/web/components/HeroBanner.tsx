'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  { desktop: '/hero/concert1.jpg', mobile: '/hero/concert-mobile.jpg', alt: 'Massive outdoor concert with lasers' },
  { desktop: '/hero/concert2.jpg', mobile: '/hero/concert2.jpg', alt: 'Festival stage with purple and blue lights' },
  { desktop: '/hero/sport1.jpg', mobile: '/hero/sport1.jpg', alt: 'Stadium at night with purple lighting' },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[78vh] md:min-h-[88vh] flex items-end md:items-center text-white overflow-hidden bg-black">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <picture>
            <source media="(min-width: 768px)" srcSet={slide.desktop} />
            <img
              src={slide.mobile}
              alt={slide.alt}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b1f] via-black/35 to-black/15 md:bg-gradient-to-r md:from-[#0b0b1f]/75 md:via-black/25 md:to-transparent" />
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 py-16 md:py-24 w-full z-10">
        <div className="max-w-lg">
          <p className="text-[11px] sm:text-xs tracking-[0.25em] text-purple-300 font-semibold mb-2">DISCOVER. EXPERIENCE. CONNECT.</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.02]">
            Najveći događaji<br />na Balkanu
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/85 max-w-md">
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

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition ${i === current ? 'bg-white' : 'bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
