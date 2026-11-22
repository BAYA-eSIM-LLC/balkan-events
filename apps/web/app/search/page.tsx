import EventCard from '@/components/EventCard';
import { fetchEvents } from '@/lib/api';
import { Button, EmptyState } from '@/components/ui';

export const metadata = { title: 'Pretraga događaja' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; date_preset?: string }> }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.city) qs.set('city', params.city);
  if (params.date_preset) qs.set('date_preset', params.date_preset);
  const events = await fetchEvents(`/events/search?${qs.toString()}`);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-display font-bold mb-2">Pronađi događaj</h1>
      <p className="text-gray-500 mb-8">Pretraži po nazivu, gradu ili datumu.</p>

      <form className="flex flex-wrap gap-3 mb-10 bg-gray-50 p-4 rounded-2xl">
        <input name="q" defaultValue={params.q} placeholder="Naziv, izvođač..." className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
        <input name="city" defaultValue={params.city} placeholder="Grad" className="border border-gray-200 rounded-xl px-4 py-3 text-sm w-40" />
        <select name="date_preset" defaultValue={params.date_preset || ''} className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
          <option value="">Bilo kada</option>
          <option value="today">Danas</option>
          <option value="tomorrow">Sutra</option>
          <option value="weekend">Ovaj vikend</option>
          <option value="next7">Narednih 7 dana</option>
          <option value="next30">Narednih 30 dana</option>
        </select>
        <Button type="submit" className="btn-gradient text-white">Traži</Button>
      </form>

      {events.length === 0 ? (
        <EmptyState title="Nema rezultata" description="Pokušaj drugačije kriterije ili pogledaj sve događaje." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
