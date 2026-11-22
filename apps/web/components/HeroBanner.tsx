'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  { id: 'koncerti', label: 'Koncerti', title: 'Koncerti koji ostaju', desc: 'Najveće turneje i live nastupi na Balkanu.', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2000&q=80' },
  { id: 'festivali', label: 'Festivali', title: 'Festivali koji se pamte', desc: 'Otvoreni prostori, muzika i energija.', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=2000&q=80' },
  { id: 'sport', label: 'Sport', title: 'Sportski događaji', desc: 'Utakmice, maratoni i takmičenja.', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=2000&q=80' },
  { id: 'teatar', label: 'Teatar', title: 'Teatar i predstave', desc: 'Klasika i savremena scena.', img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=2000&q=80' },
  { id: 'standup', label: 'Stand-up', title: 'Stand-up večeri', desc: 'Smijeh i najbolji komičari.', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=2000&q=80' },
  { id: 'night', label: 'Noćni život', title: 'Noćni život', desc: 'Klubovi, DJ-evi i party.', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2000&q=80' },
  { id: 'conf', label: 'Konferencije', title: 'Konferencije', desc: 'Business, tech i networking.', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80' },
  { id: 'kultura', label: 'Kultura', title: 'Kultura i umjetnost', desc: 'Izložbe, festivali i tradicija.', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=2000&q=80' },
];

export default function HeroBanner() {
  const [idx, setIdx] = useState(0);
  const s = slides[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-[78vh] md:min-h-[88vh] flex items-center text-white overflow-hidden pt-16">
      {slides.map((sl, i) => (
        <img key={sl.id} src={sl.img} alt="" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === idx ? 'opacity-100' : 'opacity-0'}`} />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b1f]/95 via-[#0d0b1f]/70 to-[#0d0b1f]/30" />
      <div className="relative max-w-6xl mx-auto px-5 py-20 w-full">
        <p className="text-xs md:text-sm tracking-[0.28em] text-[#d4af77] font-medium mb-4">DISCOVER · EXPERIENCE · CONNECT</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.02] max-w-3xl transition-all duration-500">{s.title}</h1>
        <p className="mt-5 text-lg md:text-xl text-white/75 max-w-lg transition-all duration-500">{s.desc}</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/search" className="bg-[#6d3df5] hover:bg-[#7c50ff] px-8 py-4 rounded-2xl font-semibold text-center transition">Istraži događaje</Link>
          <Link href="/organizer" className="border border-white/30 hover:bg-white/10 px-8 py-4 rounded-2xl font-medium text-center transition">Postani organizator</Link>
        </div>
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {slides.map((sl, i) => (
            <button key={sl.id} onClick={() => setIdx(i)} className={`shrink-0 px-4 py-2 rounded-full text-sm border transition ${i === idx ? 'bg-white text-[#0d0b1f] border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}>
              {sl.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
