import Link from 'next/link';
import { EventItem, formatDate } from '@/lib/api';

const FALLBACK = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

export function EventCard({ event, large = false }: { event: EventItem; large?: boolean }) {
  const img = event.image_url || FALLBACK;
  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-black/5 ${large ? 'md:col-span-1' : ''}`}
    >
      <div className={`relative overflow-hidden ${large ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}>
        <img
          src={img}
          alt={event.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {event.is_featured && (
          <span className="absolute top-3 left-3 bg-[#C7A76C] text-[#0b1020] text-xs font-semibold px-2.5 py-1 rounded-full">
            Istaknuto
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{event.title}</h3>
          <p className="text-sm text-white/80 mt-1">{event.city || 'Lokacija'}</p>
          <p className="text-sm text-[#C7A76C] mt-0.5">{formatDate(event.start_at, event.timezone)}</p>
        </div>
      </div>
    </Link>
  );
}
