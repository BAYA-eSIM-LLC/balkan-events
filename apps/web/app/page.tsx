import HeroBanner from '@/components/HeroBanner';
import Link from 'next/link';

const cities = [
  { name: 'Sarajevo', img: 'https://images.unsplash.com/photo-1555990793-da11153b2473?auto=format&fit=crop&w=800&q=80' },
  { name: 'Zagreb', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Beograd', img: 'https://images.unsplash.com/photo-1548783307-f63adc3f200b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Mostar', img: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80' },
];

const categories = [
  { name: 'Koncerti', href: '/search?category=koncerti', icon: '🎤' },
  { name: 'Festivali', href: '/search?category=festivali', icon: '🎪' },
  { name: 'Pozorište', href: '/search?category=pozoriste', icon: '🎭' },
  { name: 'Sport', href: '/search?category=sport', icon: '⚽' },
  { name: 'Stand-up', href: '/search?category=standup', icon: '😂' },
  { name: 'Kultura', href: '/search?category=kultura', icon: '🎨' },
];

function EmptyState({ title }: { title: string }) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-10 text-center">
      <p className="text-zinc-500">{title}</p>
      <Link href="/search" className="inline-block mt-4 text-[#e11d48] text-sm font-medium hover:underline">Pogledaj sve događaje</Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-14 md:py-16 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 md:mb-8">{title}</h2>
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
        <EmptyState title="Događaji će biti prikazani čim budu dostupni u sistemu." />
      </Section>

      <Section title="Najpopularniji koncerti">
        <EmptyState title="Popularni koncerti će se pojaviti ovdje." />
      </Section>

      <Section title="Festivali">
        <EmptyState title="Festivali će biti prikazani čim budu objavljeni." />
      </Section>

      <Section title="Događaji ovog vikenda">
        <EmptyState title="Vikend događaji će biti dostupni uskoro." />
      </Section>

      <Section title="Događaji po gradovima">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {cities.map(c => (
            <Link key={c.name} href={`/search?city=${c.name}`} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
              <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <span className="absolute bottom-3 left-3 text-white font-semibold text-base md:text-lg">{c.name}</span>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Kategorije">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map(c => (
            <Link key={c.name} href={c.href} className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl py-5 md:py-6 text-center transition group">
              <span className="text-2xl">{c.icon}</span>
              <p className="mt-2 text-sm font-medium text-zinc-700 group-hover:text-zinc-900">{c.name}</p>
            </Link>
          ))}
        </div>
      </Section>

      <section className="py-16 md:py-20 bg-zinc-950 text-white">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Organiziraš događaje?</h2>
          <p className="mt-3 md:mt-4 text-zinc-400 text-base md:text-lg">Kreiraj događaj, prodaj ulaznice i upravljaj prodajom na jednom mjestu.</p>
          <Link href="/organizer" className="inline-block mt-6 md:mt-8 bg-[#e11d48] hover:bg-[#be123c] px-8 py-3.5 rounded-lg font-semibold transition">Postani organizator</Link>
        </div>
      </section>
    </>
  );
}
