import EventCard from '@/components/EventCard';
import { fetchEvents } from '@/lib/api';

export const metadata = { title: 'Pretraga događaja' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; date_preset?: string }> }) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.city) qs.set('city', params.city);
  if (params.date_preset) qs.set('date_preset', params.date_preset);
  const events = await fetchEvents(`/events/search?${qs.toString()}`);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pretraga događaja</h1>
      <form className="flex flex-wrap gap-2 mb-6">
        <input name="q" defaultValue={params.q} placeholder="Naziv, izvođač..." className="border rounded px-3 py-2 text-sm" />
        <input name="city" defaultValue={params.city} placeholder="Grad" className="border rounded px-3 py-2 text-sm" />
        <select name="date_preset" defaultValue={params.date_preset || ''} className="border rounded px-3 py-2 text-sm">
          <option value="">Bilo kada</option>
          <option value="today">Danas</option>
          <option value="tomorrow">Sutra</option>
          <option value="weekend">Ovaj vikend</option>
          <option value="next7">Narednih 7 dana</option>
          <option value="next30">Narednih 30 dana</option>
        </select>
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded text-sm">Traži</button>
      </form>
      {events.length === 0 ? (
        <p className="text-gray-500">Nema rezultata za zadate kriterije.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  );
}
