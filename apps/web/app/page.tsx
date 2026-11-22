import { EventCard, SectionHeading, EmptyState } from '@/components/ui';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

const HERO = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=2000&q=85';

const cats = [
  { label: 'Koncerti', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=700&q=80', href: '/search?q=koncert' },
  { label: 'Festivali', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=700&q=80', href: '/search?q=festival' },
  { label: 'Sport', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba6851?auto=format&fit=crop&w=700&q=80', href: '/search?q=sport' },
  { label: 'Teatar', img: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=700&q=80', href: '/search?q=teatar' },
  { label: 'Noćni život', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80', href: '/search?q=night' },
  { label: 'Stand-up', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=700&q=80', href: '/search?q=standup' },
  { label: 'Konferencije', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=80', href: '/search?q=conference' },
  { label: 'Kultura', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=700&q=80', href: '/search?q=kultura' },
];

const cities = [
  { name: 'Sarajevo', img: 'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=700&q=80' },
  { name: 'Beograd', img: 'https://images.unsplash.com/photo-1541343672885-9be56236302a?auto=format&fit=crop&w=700&q=80' },
  { name: 'Zagreb', img: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?auto=format&fit=crop&w=700&q=80' },
  { name: 'Mostar', img: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=700&q=80' },
];

export default async function Home() {
  const [popular, upcoming] = await Promise.all([
    fetchEvents('/events/popular?limit=6'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);
  const featured = popular.filter(e => e.is_featured).slice(0, 3);

  return (
    <div className="bg-[#f8fafc]">
      <section className="relative min-h-[82vh] md:min-h-[90vh] flex items-center text-white overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/95 via-[#070b14]/65 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-5 py-24 w-full">
          <p className="text-xs md:text-sm tracking-[0.28em] text-[#d4af77] font-medium mb-5">DISCOVER · EXPERIENCE · CONNECT</p>
          <h1 className="text-[2.6rem] md:text-6xl lg:text-7xl font-display font-semibold leading-[1.02] max-w-3xl">
            Najveći događaji na Balkanu
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/75 max-w-lg">
            Koncerti, festivali, sport i kultura. Jedno mjesto za BiH, Hrvatsku, Srbiju i šire.
          </p>
          <form action="/search" className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl">
            <input name="q" placeholder="Traži događaj, izvođača ili grad" className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]" />
            <button type="submit" className="btn-violet px-8 py-4 rounded-2xl font-medium">Pretraži</button>
          </form>
          <div className="mt-8 flex flex-wrap gap-2 text-sm">
            {['Ovaj vikend','Sarajevo','Beograd','Zagreb'].map(t => (
              <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="px-4 py-1.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/20 transition">{t}</Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-16">
        <SectionHeading title="Istraži po kategorijama" />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {cats.map(c => (
            <Link key={c.label} href={c.href} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
              <img src={c.img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <span className="absolute bottom-4 left-4 text-white font-medium text-lg">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 py-6">
        <SectionHeading title="Istaknuti događaji" />
        {featured.length > 0 ? (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {featured.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <EmptyState title="Još nema istaknutih događaja" description="Organizatori uskoro objavljuju prve događaje." action={{ label: 'Istraži kategorije', href: '/categories' }} />
        )}
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <SectionHeading title="Nadolazeći događaji" />
        {upcoming.length > 0 ? (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <EmptyState title="Nema nadolazećih događaja" description="Provjeri ponovno uskoro." />
        )}
      </section>

      <section className="max-w-7xl mx-auto px-5 py-12">
        <SectionHeading title="Popularni gradovi" />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {cities.map(c => (
            <Link key={c.name} href={`/search?q=${encodeURIComponent(c.name)}`} className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm">
              <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/35 transition" />
              <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-display font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mt-16 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/95 to-[#7c3aed]/75" />
        <div className="relative max-w-7xl mx-auto px-5 py-24 text-white">
          <h2 className="text-3xl md:text-5xl font-display font-semibold max-w-lg">Organizuješ događaj?</h2>
          <p className="mt-4 text-lg text-white/75 max-w-md">Kreiraj profil i dosegni publiku širom Balkana.</p>
          <Link href="/organizer" className="inline-block mt-8 bg-white text-[#070b14] font-medium px-8 py-4 rounded-2xl hover:bg-gray-100 transition">Postani organizator</Link>
        </div>
      </section>
    </div>
  );
}
