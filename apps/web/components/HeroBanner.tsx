'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  { id: 'koncerti', label: 'Koncerti', title: 'Koncerti koji ostaju', desc: 'Najveće turneje i live nastupi.', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2000&q=80' },
  { id: 'festivali', label: 'Festivali', title: 'Festivali koji se pamte', desc: 'Otvoreni prostori i energija.', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=2000&q=80' },
  { id: 'sport', label: 'Sport', title: 'Sportski događaji', desc: 'Utakmice i takmičenja.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=2000&q=80' },
  { id: 'teatar', label: 'Teatar', title: 'Teatar i predstave', desc: 'Klasika i savremena scena.', img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=2000&q=80' },
  { id: 'standup', label: 'Stand-up', title: 'Stand-up večeri', desc: 'Smijeh i komičari.', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=2000&q=80' },
  { id: 'night', label: 'Noćni život', title: 'Noćni život', desc: 'Klubovi, DJ-evi i party.', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80' },
  { id: 'conf', label: 'Konferencije', title: 'Konferencije', desc: 'Business, tech i networking.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80' },
  { id: 'kultura', label: 'Kultura', title: 'Kultura i umjetnost', desc: 'Izložbe i tradicija.', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=2000&q=80' },
];

export default function HeroBanner() {
  const [idx, setIdx] = useState(0);
  const s = slides[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center text-white overflow-hidden pt-14">
      {slides.map((sl, i) => (
        <img key={sl.id} src={sl.img} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b1f]/80 via-[#0d0b1f]/50 to-[#0d0b1f]/90" />
      <div className="relative max-w-6xl mx-auto px-5 py-16 w-full text-center md:text-left">
        <p className="text-xs tracking-[0.25em] text-[#d4af77] font-medium mb-3">DISCOVER · EXPERIENCE · CONNECT</p>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold leading-[1.05]">{s.title}</h1>
        <p className="mt-3 text-base md:text-lg text-white/80 max-w-md mx-auto md:mx-0">{s.desc}</p>

        {/* SEARCH BAR - prominent */}
        <form action="/search" className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto md:mx-0">
          <input name="q" placeholder="Traži događaj, izvođača ili grad" className="flex-1 bg-white/15 backdrop-blur border border-white/25 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#6d3df5] text-sm" />
          <button type="submit" className="bg-[#6d3df5] hover:bg-[#7c50ff] px-6 py-3.5 rounded-2xl font-semibold text-sm transition">Pretraži</button>
        </form>

        {/* CATEGORY PILLS */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 justify-center md:justify-start scrollbar-hide">
          {slides.map((sl, i) => (
            <button key={sl.id} onClick={() => setIdx(i)} className={`shrink-0 px-4 py-2 rounded-full text-sm border transition ${i === idx ? 'bg-white text-[#0d0b1f] border-white' : 'bg-white/10 border-white/25 hover:bg-white/20'}`}>
              {sl.label}
            </button>
          ))}
        </div>

        {/* CTA BUTTONS */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
          <Link href="/search" className="bg-[#6d3df5] hover:bg-[#7c50ff] px-6 py-3 rounded-xl font-semibold text-sm text-center transition">Istraži događaje</Link>
          <Link href="/organizer" className="border border-white/30 hover:bg-white/10 px-6 py-3 rounded-xl font-medium text-sm text-center transition">Postani organizator</Link>
        </div>
      </div>
    </section>
  );
}
