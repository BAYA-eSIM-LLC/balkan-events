import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import Link from 'next/link';

const cities = [
  { name: 'Sarajevo', img: 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&q=80' },
  { name: 'Zagreb', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beograd', img: 'https://images.unsplash.com/photo-1548783307-f63adc3f200b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mostar', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80' },
];

const cats = [
  { name: 'Koncerti', icon: '🎤' },
  { name: 'Festivali', icon: '🎪' },
  { name: 'Sport', icon: '⚽' },
  { name: 'Teatar', icon: '🎭' },
  { name: 'Stand-up', icon: '😂' },
  { name: 'Noćni život', icon: '🌙' },
];

export default function Home() {
  return (
    <>
      <Header />
      <HeroBanner />

      <section className="py-12 bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold mb-6">Gradovi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map(c => (
              <Link key={c.name} href={`/search?city=${c.name}`} className="relative aspect-[4/5] rounded-2xl overflow-hidden group">
                <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <span className="absolute bottom-3 left-3 font-semibold">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold mb-6">Kategorije</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {cats.map(c => (
              <Link key={c.name} href={`/search?category=${c.name}`} className="bg-zinc-800 hover:bg-zinc-700 rounded-xl p-4 text-center transition">
                <span className="text-2xl">{c.icon}</span>
                <p className="mt-2 text-sm">{c.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-2xl font-bold">Organiziraš događaje?</h2>
          <p className="mt-3 text-white/70">Kreiraj događaj, prodaj ulaznice i prati prodaju.</p>
          <Link href="/organizer" className="inline-block mt-6 bg-[#ff4d4d] hover:bg-[#ff6b6b] px-8 py-3 rounded-xl font-semibold transition">Postani organizator</Link>
        </div>
      </section>

      <footer className="bg-black text-white/60 py-10 text-sm">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="font-semibold text-white">BALKAN EVENTS</p>
            <p className="mt-2">Događaji na Balkanu.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">Privatnost</Link>
            <Link href="/terms" className="hover:text-white">Uvjeti</Link>
            <Link href="/support" className="hover:text-white">Podrška</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
