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

const featured = [
  { title: 'Koncert uživo', img: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=600&q=80', city: 'Sarajevo' },
  { title: 'Festival', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80', city: 'Zagreb' },
  { title: 'Sportski događaj', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80', city: 'Beograd' },
  { title: 'Pozorišna predstava', img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80', city: 'Mostar' },
];

const concerts = [
  { title: 'Live nastup', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80' },
  { title: 'Rock koncert', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80' },
  { title: 'Pop večer', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80' },
];

const festivals = [
  { title: 'Open air', img: 'https://images.unsplash.com/photo-1459749411177-04de6a6f8c9b?auto=format&fit=crop&w=600&q=80' },
  { title: 'Muzički festival', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80' },
  { title: 'Ljetni festival', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80' },
];

function Card({ title, img, city }: { title: string; img: string; city?: string }) {
  return (
    <Link href="/search" className="group block">
      <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-zinc-100">
        <img src={img} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <p className="font-semibold text-sm">{title}</p>
          {city && <p className="text-xs text-white/70">{city}</p>}
        </div>
      </div>
    </Link>
  );
}

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(e => <Card key={e.title} {...e} />)}
        </div>
      </Section>

      <Section title="Najpopularniji koncerti">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {concerts.map(e => <Card key={e.title} {...e} />)}
        </div>
      </Section>

      <Section title="Festivali">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {festivals.map(e => <Card key={e.title} {...e} />)}
        </div>
      </Section>

      <Section title="Događaji ovog vikenda">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.slice(0, 3).map(e => <Card key={e.title} {...e} />)}
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
