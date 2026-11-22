import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import Link from 'next/link';

const cities = [
  { name: 'Sarajevo', img: 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&q=80' },
  { name: 'Zagreb', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beograd', img: 'https://images.unsplash.com/photo-1548783307-f63adc3f200b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mostar', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80' },
];

const categories = [
  { name: 'Koncerti', href: '/search?category=koncerti' },
  { name: 'Festivali', href: '/search?category=festivali' },
  { name: 'Pozorište', href: '/search?category=pozoriste' },
  { name: 'Sport', href: '/search?category=sport' },
  { name: 'Stand-up', href: '/search?category=standup' },
  { name: 'Kultura', href: '/search?category=kultura' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-16 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">{title}</h2>
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroBanner />

      <Section title="Istaknuti događaji">
        <div className="bg-zinc-50 rounded-xl p-8 text-center text-zinc-500">
          <p>Događaji će biti prikazani čim budu dostupni u sistemu.</p>
          <Link href="/search" className="inline-block mt-4 text-[#e11d48] font-medium hover:underline">Pogledaj sve događaje</Link>
        </div>
      </Section>

      <Section title="Najpopularniji koncerti">
        <div className="bg-zinc-50 rounded-xl p-8 text-center text-zinc-500">
          <p>Popularni koncerti će se pojaviti ovdje.</p>
        </div>
      </Section>

      <Section title="Festivali">
        <div className="bg-zinc-50 rounded-xl p-8 text-center text-zinc-500">
          <p>Festivali će biti prikazani čim budu objavljeni.</p>
        </div>
      </Section>

      <Section title="Događaji ovog vikenda">
        <div className="bg-zinc-50 rounded-xl p-8 text-center text-zinc-500">
          <p>Vikend događaji će biti dostupni uskoro.</p>
        </div>
      </Section>

      <Section title="Događaji po gradovima">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map(c => (
            <Link key={c.name} href={`/search?city=${c.name}`} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
              <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-semibold text-lg">{c.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Kategorije">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(c => (
            <Link key={c.name} href={c.href} className="bg-zinc-100 hover:bg-zinc-200 rounded-lg py-6 text-center font-medium transition">
              {c.name}
            </Link>
          ))}
        </div>
      </Section>

      <section className="py-20 bg-zinc-950 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">Organiziraš događaje?</h2>
          <p className="mt-4 text-zinc-400 text-lg">Kreiraj događaj, prodaj ulaznice i upravljaj prodajom na jednom mjestu.</p>
          <Link href="/organizer" className="inline-block mt-8 bg-[#e11d48] hover:bg-[#be123c] px-8 py-3.5 rounded-lg font-semibold transition">Postani organizator</Link>
        </div>
      </section>
    </>
  );
}
