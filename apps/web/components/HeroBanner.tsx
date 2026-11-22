'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HeroBanner() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <section className="relative min-h-[100vh] flex items-center text-white overflow-hidden pt-16 pb-28">
      <img src="https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1800&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/85" />

      <div className="relative max-w-lg mx-auto px-5 w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Najveći događaji<br />na Balkanu</h1>
        <p className="mt-4 text-white/80 text-base">Pronađi koncerte, festivale i predstave u svom gradu.</p>

        <div className="mt-6 flex gap-2 justify-center overflow-x-auto pb-1">
          {['Danas', 'Vikend', 'Besplatno', 'Blizu mene'].map(f => (
            <Link key={f} href={`/search?filter=${f.toLowerCase()}`} className="shrink-0 px-4 py-2 rounded-full text-sm bg-white/15 border border-white/25 hover:bg-white/25 transition">
              {f}
            </Link>
          ))}
        </div>

        <form action="/search" className="mt-5 flex gap-2">
          <input name="q" placeholder="Traži događaj ili grad" className="flex-1 bg-white text-zinc-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d4d]" />
          <button type="submit" className="bg-[#ff4d4d] hover:bg-[#ff6b6b] px-5 py-3.5 rounded-xl font-semibold text-sm transition">Traži</button>
        </form>

        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="mt-8 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/15">
            <p className="text-sm font-medium mb-2">Prvi događaji stižu uskoro</p>
            <div className="flex gap-2">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Tvoj email" className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder:text-white/50 focus:outline-none" />
              <button type="submit" className="bg-[#ff4d4d] px-4 py-2 rounded-lg text-sm font-medium">Obavijesti me</button>
            </div>
          </form>
        ) : (
          <p className="mt-8 text-sm text-green-300">Hvala! Javit ćemo ti se.</p>
        )}
      </div>
    </section>
  );
}
