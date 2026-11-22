'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  { id: 'koncerti', label: 'Koncerti', title: 'Koncerti koji ostaju', desc: 'Najveće turneje i live nastupi na Balkanu.', img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80' },
  { id: 'festivali', label: 'Festivali', title: 'Festivali koji se pamte', desc: 'Otvoreni prostori, muzika i energija.', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1600&q=80' },
  { id: 'sport', label: 'Sport', title: 'Sportski događaji', desc: 'Utakmice, maratoni i takmičenja.', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80' },
  { id: 'teatar', label: 'Teatar', title: 'Teatar i predstave', desc: 'Klasika i savremena scena.', img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1600&q=80' },
  { id: 'standup', label: 'Stand-up', title: 'Stand-up večeri', desc: 'Smijeh i najbolji komičari.', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1600&q=80' },
  { id: 'night', label: 'Noćni život', title: 'Noćni život', desc: 'Klubovi, DJ-evi i party.', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80' },
  { id: 'conf', label: 'Konferencije', title: 'Konferencije', desc: 'Business, tech i networking.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80' },
  { id: 'kultura', label: 'Kultura', title: 'Kultura i umjetnost', desc: 'Izložbe, festivali i tradicija.', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1600&q=80' },
];

export default function HeroBanner() {
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const s = slides[idx];

  useEffect(() => {
    setReady(true);
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-[100vh] md:min-h-[92vh] flex items-center text-white overflow-hidden pt-16">
      {slides.map((sl, i) => (
        <img key={sl.id} src={sl.img} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b1f]/60 via-[#0d0b1f]/35 to-[#0d0b1f]/80" />

      <div className={`relative max-w-5xl mx-auto px-5 w-full text-center transition-all duration-700 ${ready ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-xs tracking-[0.3em] text-[#d4af77] font-medium mb-4">DISCOVER · EXPERIENCE · CONNECT</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold leading-[1.05] drop-shadow-lg">{s.title}</h1>
        <p className="mt-4 text-base sm:text-lg text-white/90 max-w-md mx-auto">{s.desc}</p>

        <form action="/search" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input name="q" placeholder="Traži događaj ili grad" className="flex-1 bg-white text-zinc-900 rounded-2xl px-5 py-4 text-base placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#6d3df5] shadow-lg" />
          <button type="submit" className="bg-[#6d3df5] hover:bg-[#7c50ff] text-white px-6 py-4 rounded-2xl font-semibold text-base shadow-lg transition">Pretraži</button>
        </form>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 justify-center scrollbar-hide">
          {slides.map((sl, i) => (
            <button key={sl.id} onClick={() => setIdx(i)} className={`shrink-0 px-4 py-2.5 rounded-full text-sm font-medium border transition ${i === idx ? 'bg-white text-[#0d0b1f] border-white' : 'bg-black/40 border-white/30 text-white hover:bg-white/20'}`}>
              {sl.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/search" className="bg-white/15 hover:bg-white/25 border border-white/30 px-6 py-3 rounded-xl font-medium text-sm transition">Istraži događaje</Link>
          <Link href="/organizer" className="bg-white/15 hover:bg-white/25 border border-white/30 px-6 py-3 rounded-xl font-medium text-sm transition">Postani organizator</Link>
        </div>
      </div>
    </section>
  );
}
