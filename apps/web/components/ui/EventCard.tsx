import Link from 'next/link';
import { EventItem, formatDate } from '@/lib/api';
import { Badge } from './Badge';

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-card hover:shadow-card-hover transition-shadow"
    >
      <div className="relative h-48 bg-gray-100">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-subtle text-sm">Nema slike</div>
        )}
        {event.is_featured && (
          <div className="absolute top-3 left-3">
            <Badge variant="accent">Istaknuto</Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-ink line-clamp-2 group-hover:text-brand-700 transition-colors">{event.title}</h3>
        <p className="text-sm text-ink-muted mt-1">{event.city}{event.country ? `, ${event.country}` : ''}</p>
        <p className="text-sm text-brand-600 mt-1 font-medium">{formatDate(event.start_at, event.timezone)}</p>
        {event.short_description && (
          <p className="text-sm text-ink-muted mt-2 line-clamp-2">{event.short_description}</p>
        )}
      </div>
    </Link>
  );
}
