import EventCard from '@/components/EventCard';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

const categories = [
  { label: 'Koncerti', symbol: '♫', query: 'Koncerti' },
  { label: 'Festivali', symbol: '✳', query: 'Festivali' },
  { label: 'Sport', symbol: '◎', query: 'Sport' },
  { label: 'Kultura', symbol: '✦', query: 'Kultura' },
  { label: 'Teatar', symbol: '▣', query: 'Teatar' },
  { label: 'Porodični', symbol: '♡', query: 'Porodični' },
];

export default async function Home() {
  const [featured, upcoming] = await Promise.all([
    fetchEvents('/events/featured?limit=8'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);

  return (
    <div className="space-y-10 pb-12 sm:space-y-14">
      <section className="home-hero relative isolate flex min-h-[440px] items-start overflow-hidden rounded-[2rem] px-6 py-9 text-white shadow-xl sm:min-h-[500px] sm:px-10 sm:py-12 lg:px-14">
        <div className="hero-glow" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-orange-200 sm:text-sm">Tvoj vodič kroz najbolja iskustva</p>
          <h1 className="max-w-xl text-[2.35rem] font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            Pronađi svoje sljedeće <span className="text-orange-400">događanje</span> na Balkanu
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-lg sm:leading-7">
            Koncerti · Festivali · Sport · Kultura
          </p>
          <Link href="/search" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-orange-600 px-7 text-sm font-extrabold text-white shadow-lg shadow-orange-950/25 transition hover:bg-orange-500 sm:text-base">
            Pronađi događaje <span aria-hidden="true" className="ml-2">→</span>
          </Link>
          <div className="mt-12 flex items-center gap-3 text-xs font-medium text-white/70 sm:mt-16">
            <span className="h-2 w-2 rounded-full bg-orange-400" />
            Događaji iz cijele regije na jednom mjestu
          </div>
        </div>
        <div className="hero-decoration" aria-hidden="true"><span>BE</span></div>
      </section>

      <form action="/search" role="search" className="mx-auto flex w-full max-w-4xl items-center rounded-full border border-orange-100 bg-white p-2 shadow-[0_12px_35px_rgba(124,45,18,.08)]">
        <label htmlFor="home-search" className="sr-only">Pretraži događaje, izvođače i gradove</label>
        <span aria-hidden="true" className="pl-3 text-2xl text-orange-600">⌕</span>
        <input id="home-search" name="q" placeholder="Pretraži događaje, izvođače ili gradove..." className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 sm:text-base" />
        <button type="submit" className="min-h-11 shrink-0 rounded-full bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700 sm:px-7">Pretraži</button>
      </form>

      <section aria-label="Kategorije događaja">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">Istraži po kategorijama</h2>
          <Link href="/categories" className="text-sm font-bold text-orange-700">Sve kategorije →</Link>
        </div>
        <div className="category-strip">
          {categories.map(category => (
            <Link key={category.label} href={`/search?q=${encodeURIComponent(category.query)}`} className="category-tile">
              <span className="category-symbol" aria-hidden="true">{category.symbol}</span>
              <span>{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="featured-heading">
          <div className="mb-5 flex items-end justify-between gap-3 border-b border-orange-200 pb-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-orange-700">Ne propusti</p>
              <h2 id="featured-heading" className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Popularni događaji</h2>
            </div>
            <Link href="/search" className="shrink-0 text-sm font-bold text-orange-700">Svi događaji →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading">
          <div className="mb-5 flex items-end justify-between gap-3 border-b border-orange-200 pb-3">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-orange-700">Rezerviši datum</p>
              <h2 id="upcoming-heading" className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Uskoro</h2>
            </div>
            <Link href="/search" className="shrink-0 text-sm font-bold text-orange-700">Pogledaj sve →</Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {featured.length === 0 && upcoming.length === 0 && (
        <section className="rounded-3xl border border-orange-100 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-orange-700">Nova iskustva počinju ovdje</p>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-950">Događaji se uskoro pojavljuju</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Trenutno nema objavljenih događaja. Vrati se uskoro ili istraži platformu.</p>
          <Link href="/search" className="mt-6 inline-flex rounded-full bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700">Istraži događaje</Link>
        </section>
      )}
    </div>
  );
}
