import EventCard from '@/components/EventCard';
import { fetchEvents } from '@/lib/api';
import Link from 'next/link';

export default async function Home() {
  const [popular, upcoming] = await Promise.all([
    fetchEvents('/events/popular?limit=8'),
    fetchEvents('/events/upcoming?limit=8'),
  ]);
  return (
    <div>
      <section className="bg-gradient-to-r from-brand-700 to-brand-500 text-white rounded-xl p-8 mb-8">
        <h1 className="text-3xl font-bold">BALKAN EVENTS</h1>
        <p className="mt-2 text-lg opacity-90">Pronađi koncerte, festivale i događaje u regiji</p>
        <Link href="/search" className="inline-block mt-4 bg-white text-brand-700 px-5 py-2 rounded font-medium">Pretraži događaje</Link>
      </section>

      {popular.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Popularni događaji</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popular.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Predstojeći događaji</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcoming.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}

      {popular.length === 0 && upcoming.length === 0 && (
        <p className="text-gray-500 text-center py-12">Trenutno nema objavljenih događaja. Provjerite kasnije.</p>
      )}
    </div>
  );
}
