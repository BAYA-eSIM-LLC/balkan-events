import { EventCard, SectionHeading, EmptyState, Container } from '@/components/ui';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

const categories = [
  { label: 'Koncerti', href: '/search?q=koncert' },
  { label: 'Festivali', href: '/search?q=festival' },
  { label: 'Sport', href: '/search?q=sport' },
  { label: 'Teatar', href: '/search?q=teatar' },
  { label: 'Kultura', href: '/search?q=kultura' },
];

export default async function Home() {
  const [popular, upcoming] = await Promise.all([
    fetchEvents('/events/popular?limit=8'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);

  const featured = popular.filter(e => e.is_featured).slice(0, 4);
  const hasEvents = popular.length > 0 || upcoming.length > 0;

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10" />
        <Container className="relative py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight max-w-2xl">
            Pronađi događaje na Balkanu
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/80 max-w-xl">
            Koncerti, festivali, sport i kultura — sve na jednom mjestu.
          </p>
          <form action="/search" className="mt-8 flex max-w-lg">
            <input
              name="q"
              placeholder="Pretraži događaje..."
              className="flex-1 rounded-l-full px-5 py-3 text-ink text-sm focus:outline-none"
            />
            <button type="submit" className="bg-accent-500 hover:bg-accent-600 text-white px-6 rounded-r-full font-medium text-sm">
              Traži
            </button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map(c => (
              <Link key={c.href} href={c.href} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-sm">
                {c.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-12 space-y-12">
        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <SectionHeading title="Istaknuti događaji" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* Popular */}
        {popular.length > 0 && (
          <section>
            <SectionHeading title="Popularni događaji" action={<Link href="/search" className="text-sm text-brand-600">Vidi sve</Link>} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popular.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <SectionHeading title="Nadolazeći događaji" action={<Link href="/search?date_preset=next30" className="text-sm text-brand-600">Vidi sve</Link>} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcoming.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          </section>
        )}

        {/* Empty */}
        {!hasEvents && (
          <EmptyState
            title="Trenutno nema objavljenih događaja"
            description="Provjerite kasnije ili postanite organizator."
          />
        )}

        {/* Organizer CTA */}
        <section className="bg-surface rounded-2xl border border-gray-200 p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-ink">Organizuj događaj</h2>
          <p className="mt-2 text-ink-muted max-w-md mx-auto">
            Kreiraj i promoviraj svoj događaj na BALKAN EVENTS platformi.
          </p>
          <Link href="/support" className="inline-block mt-6 bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700">
            Kontaktiraj nas
          </Link>
        </section>
      </Container>
    </div>
  );
}
