import { EventCard, SectionHeading, EmptyState } from '@/components/ui';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

const HERO_IMG = 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80';
const ORG_IMG = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80';

const cats = [
  { label: 'Koncerti', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70', href: '/search?q=koncert' },
  { label: 'Festivali', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=70', href: '/search?q=festival' },
  { label: 'Sport', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?w=400&q=70', href: '/search?q=sport' },
  { label: 'Teatar', img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&q=70', href: '/search?q=teatar' },
  { label: 'Noćni život', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70', href: '/search?q=night' },
  { label: 'Stand-up', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=400&q=70', href: '/search?q=standup' },
  { label: 'Konferencije', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=70', href: '/search?q=conference' },
  { label: 'Kultura', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=70', href: '/search?q=kultura' },
  { label: 'Ostalo', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=70', href: '/categories' },
];

export default async function Home() {
  const [popular, upcoming] = await Promise.all([
    fetchEvents('/events/popular?limit=6'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);
  const featured = popular.filter(e => e.is_featured).slice(0, 3);

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative bg-[#0b1220] text-white min-h-[520px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220] via-[#0b1220]/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 w-full">
          <p className="text-sm tracking-[0.2em] text-purple-300 font-medium">DISCOVER. EXPERIENCE. CONNECT.</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold font-display leading-tight max-w-xl">
            Najveći događaji<br />na Balkanu.
          </h1>
          <p className="mt-4 text-white/70 max-w-md">Koncerti, festivali, sport i kultura — sve na jednom mjestu.</p>
          <form action="/search" className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input name="q" placeholder="Pretraži događaje..." className="flex-1 rounded-lg px-5 py-3 text-ink text-sm" />
            <input type="date" name="date" className="rounded-lg px-4 py-3 text-ink text-sm" />
            <button type="submit" className="btn-gradient text-white px-6 py-3 rounded-lg font-medium">Pretraži</button>
          </form>
          <div className="mt-8 grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {cats.map(c => (
              <Link key={c.href} href={c.href} className="group relative rounded-xl overflow-hidden h-24 sm:h-28">
                <img src={c.img} alt={c.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <SectionHeading title="Istaknuti događaji" />
        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <EmptyState title="Trenutno nema istaknutih događaja" description="Provjerite kasnije." />
        )}
      </section>

      {/* UPCOMING */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading title="Nadolazeći događaji" action={<Link href="/search" className="text-sm text-purple-600">Vidi sve</Link>} />
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcoming.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <EmptyState title="Nema nadolazećih događaja" description="Novi događaji će se pojaviti uskoro." />
          )}
        </div>
      </section>

      {/* ORGANIZER BANNER */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={ORG_IMG} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-pink-900/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-white grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold">Organizuješ događaj?</h2>
            <p className="mt-3 text-white/80 max-w-md">Kreiraj, promoviraj i upravljaj svojim događajima na BALKAN EVENTS platformi.</p>
            <Link href="/support" className="inline-block mt-6 bg-white text-purple-700 font-medium px-6 py-3 rounded-lg hover:bg-gray-100">Postani organizator</Link>
          </div>
          <div className="hidden md:block bg-white/10 backdrop-blur rounded-2xl p-6 text-sm">
            <p className="font-medium mb-2">Organizatorski dashboard</p>
            <p className="text-white/70">Pregled događaja, prodaja i statistika — uskoro dostupno.</p>
          </div>
        </div>
      </section>

      {/* APP */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-ink">Balkan Events aplikacija</h2>
        <p className="mt-2 text-ink-muted max-w-md mx-auto">Kupuj karte, prati događaje i dobijaj obavijesti.</p>
        <ul className="mt-6 text-sm text-ink-muted space-y-1 max-w-xs mx-auto text-left">
          <li>• Brza i sigurna kupovina</li>
          <li>• Digitalne ulaznice (QR)</li>
          <li>• Personalizovane preporuke</li>
          <li>• Obavijesti o omiljenim događajima</li>
        </ul>
        <p className="mt-4 text-xs text-ink-subtle">Aplikacija će biti dostupna uskoro.</p>
      </section>
    </div>
  );
}
