import Link from 'next/link';
import { EventItem, formatDate } from '@/lib/api';

export default function EventCard({ event }: { event: EventItem }) {
  return (
    <Link href={`/events/${event.slug}`} className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition">
      <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
        {event.image_url ? <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" /> : 'Nema slike'}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{event.city}{event.country ? `, ${event.country}` : ''}</p>
        <p className="text-sm text-brand-600 mt-1">{formatDate(event.start_at, event.timezone)}</p>
        {event.short_description && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{event.short_description}</p>}
      </div>
    </Link>
  );
}
