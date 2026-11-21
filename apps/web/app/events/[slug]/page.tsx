import { fetchEventBySlug, formatDate } from '@/lib/api';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  return { title: event?.title || 'Događaj', description: event?.short_description };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();
  return (
    <article>
      <div className="h-64 bg-gray-200 rounded-lg mb-6 flex items-center justify-center text-gray-400">
        {event.image_url ? <img src={event.image_url} alt={event.title} className="w-full h-full object-cover rounded-lg" /> : 'Nema slike'}
      </div>
      <h1 className="text-3xl font-bold">{event.title}</h1>
      <p className="text-gray-500 mt-1">{event.city}{event.country ? `, ${event.country}` : ''} • {formatDate(event.start_at, event.timezone)}</p>
      {event.venue_name && <p className="text-sm text-gray-600 mt-1">Lokacija: {event.venue_name}</p>}
      {event.short_description && <p className="mt-4 text-lg">{event.short_description}</p>}
      <div className="mt-6 p-4 bg-white border rounded-lg">
        <p className="text-sm text-gray-500">Kupovina karata će biti dostupna uskoro. Trenutno se ne vrši naplata.</p>
      </div>
    </article>
  );
}
