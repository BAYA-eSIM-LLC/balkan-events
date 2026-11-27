import EventCard from '@/components/EventCard';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

export default async function Home() {
  // The API exposes /events/featured, not /events/popular.
  const [featured, upcoming] = await Promise.all([
    fetchEvents('/events/featured?limit=8'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);

  return (
    <div className="space-y-14 pb-12">
      <section className="hero-panel relative isolate overflow-hidden rounded-[2rem] px-6 py-14 text-white shadow-2xl sm:px-12 sm:py-20">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="relative z-10 max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100">
            <span className="h-2 w-2 rounded-full bg-sky-300" /> Događaji koji nas povezuju
          </p>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            Doživi više.<br /><span className="text-sky-300">Budi dio događaja.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
            Otkrij koncerte, festivale, sport i posebna iskustva širom Balkana. Sve što vrijedi doživjeti, na jednom mjestu.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/search" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-sky-400 px-6 font-bold text-slate-950 shadow-lg shadow-sky-950/20 transition hover:bg-sky-300">
              Istraži događaje <span aria-hidden="true" className="ml-2">→</span>
            </Link>
            <Link href="/register" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 font-semibold text-white transition hover:bg-white/15">
              Postani član zajednice
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[42%] bg-gradient-to-l from-violet-500/20 to-transparent lg:block" aria-hidden="true" />
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="featured-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Izbor uredništva</p>
              <h2 id="featured-heading" className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Izdvojeni događaji</h2>
            </div>
            <Link href="/search" className="shrink-0 text-sm font-bold text-brand-700 hover:text-violet-700">Svi događaji <span aria-hidden="true">→</span></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Planiraj svoj izlazak</p>
              <h2 id="upcoming-heading" className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">Uskoro na Balkanu</h2>
            </div>
            <Link href="/search" className="shrink-0 text-sm font-bold text-brand-700 hover:text-violet-700">Otkrij više <span aria-hidden="true">→</span></Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        </section>
      )}

      {featured.length === 0 && upcoming.length === 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">Nova iskustva počinju ovdje</p>
          <h2 className="mt-3 text-2xl font-extrabold text-slate-950">Događaji se uskoro pojavljuju</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">Trenutno nema objavljenih događaja. Vrati se uskoro ili istraži platformu.</p>
          <Link href="/search" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-brand-700">Istraži događaje</Link>
        </section>
      )}
    </div>
  );
}
