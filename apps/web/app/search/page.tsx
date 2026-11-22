import { EventCard, EmptyState } from '@/components/ui';
import { fetchEvents } from '@/lib/api';

export const metadata = { title: 'Pretraga događaja · BALKAN EVENTS' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; date_preset?: string }> }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.city) qs.set('city', params.city);
  if (params.date_preset) qs.set('date_preset', params.date_preset);
  const events = await fetchEvents(`/events/search?${qs.toString()}`);

  return (
    <div className="bg-[#f6f5fb] min-h-screen pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-5">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-[#0d0b1f]">Pronađi događaj</h1>
        <p className="text-gray-500 mt-1">Pretraži po nazivu, gradu ili datumu.</p>

        <form className="mt-6 flex flex-wrap gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <input name="q" defaultValue={params.q} placeholder="Naziv, izvođač..." className="flex-1 min-w-[180px] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6d3df5]" />
          <input name="city" defaultValue={params.city} placeholder="Grad" className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-36" />
          <select name="date_preset" defaultValue={params.date_preset || ''} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
            <option value="">Bilo kada</option>
            <option value="today">Danas</option>
            <option value="tomorrow">Sutra</option>
            <option value="weekend">Ovaj vikend</option>
            <option value="next7">Narednih 7 dana</option>
            <option value="next30">Narednih 30 dana</option>
          </select>
          <button type="submit" className="bg-[#6d3df5] hover:bg-[#7c50ff] text-white px-6 py-3 rounded-xl font-medium transition">Traži</button>
        </form>

        {events.length === 0 ? (
          <div className="mt-10">
            <EmptyState title="Nema rezultata" description="Pokušaj drugačije kriterije ili istraži kategorije." />
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}
