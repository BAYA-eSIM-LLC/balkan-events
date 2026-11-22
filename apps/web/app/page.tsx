import { EventCard, SectionHeading, EmptyState } from '@/components/ui';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

const cats = [
  { label: 'Koncerti', href: '/search?q=koncert' },
  { label: 'Festivali', href: '/search?q=festival' },
  { label: 'Sport', href: '/search?q=sport' },
  { label: 'Teatar', href: '/search?q=teatar' },
  { label: 'Kultura', href: '/search?q=kultura' },
  { label: 'Noćni život', href: '/search?q=night' },
  { label: 'Stand-up', href: '/search?q=standup' },
  { label: 'Sve', href: '/categories' },
];

export default async function Home() {
  const [popular, upcoming] = await Promise.all([
    fetchEvents('/events/popular?limit=6'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);
  const featured = popular.filter(e => e.is_featured).slice(0, 3);

  return (
    <div className="bg-[#f6f5fb] min-h-screen">
      {/* HERO */}
      <section className="relative bg-[#0d0b1f] text-white overflow-hidden pt-36 pb-24">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b1f] via-[#0d0b1f]/90 to-transparent" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_70%_30%,rgba(139,98,255,.5),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-display font-extrabold leading-[1.05] max-w-xl">
            Najveći događaji na Balkanu
          </h1>
          <p className="mt-5 text-lg text-[#c9c5ea] max-w-md">
            Koncerti, festivali, sport i teatar. Pronađi, rezerviši i dođi.
          </p>
          <form action="/search" className="mt-8 flex items-center gap-1 max-w-2xl bg-white text-[#14122b] rounded-2xl p-1.5 shadow-2xl">
            <input name="q" placeholder="Događaj, izvođač ili grad" className="flex-1 px-4 py-3 outline-none bg-transparent text-base" />
            <button type="submit" className="btn-primary px-7 py-3 rounded-xl font-semibold">Pretraži</button>
          </form>
        </div>
      </section>

      {/* CATEGORIES */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <nav className="bg-white rounded-2xl p-2 shadow-lg grid grid-cols-4 md:grid-cols-8 gap-1">
          {cats.map(c => (
            <Link key={c.label} href={c.href} className="flex flex-col items-center gap-1 py-3 px-1 rounded-xl text-sm font-medium hover:bg-[#efe9ff] transition">
              <span className="text-[#6d3df5] text-xl">●</span>
              {c.label}
            </Link>
          ))}
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* FEATURED */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Istaknuti događaji</h2>
            <Link href="/search" className="text-[#6d3df5] font-semibold text-sm">Pogledaj sve →</Link>
          </div>
          {featured.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {featured.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <EmptyState title="Još nema istaknutih događaja" description="Organizatori uskoro objavljuju prve događaje." />
          )}
        </section>

        {/* UPCOMING */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Nadolazeći događaji</h2>
          </div>
          {upcoming.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcoming.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <EmptyState title="Nema nadolazećih događaja" description="Provjeri ponovno uskoro." />
          )}
        </section>

        {/* ORGANIZER */}
        <section className="rounded-3xl bg-gradient-to-br from-[#1c1250] to-[#3b1d9e] text-white p-10 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold leading-tight">Organizuješ događaj?</h2>
            <p className="mt-3 text-[#d7d2f7] max-w-sm">Objavi događaj i dođi do publike u cijeloj regiji.</p>
            <ul className="mt-6 space-y-2 text-sm">
              <li>✓ Brza objava događaja</li>
              <li>✓ Upravljanje ulaznicama</li>
              <li>✓ QR skeniranje na ulazu</li>
            </ul>
            <Link href="/organizer" className="inline-block mt-6 bg-white text-[#2a1472] font-semibold px-6 py-3 rounded-xl">Postani organizator →</Link>
          </div>
          <div className="hidden md:block bg-[#0f0c26] rounded-2xl p-6">
            <p className="text-sm text-white/60">Organizatorski dashboard</p>
            <p className="mt-2 text-white/40 text-sm">Statistika i prodaja će biti dostupne kada backend bude aktivan.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
