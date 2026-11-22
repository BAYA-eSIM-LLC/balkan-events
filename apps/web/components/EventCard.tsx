import Link from 'next/link';
import { EventItem, formatDate } from '@/lib/api';

export default function EventCard({ event }: { event: EventItem }) {
  const img = event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80';
  return (
    <Link href={`/events/${event.slug}`} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#0d0b1f] line-clamp-2 group-hover:text-[#6d3df5] transition">{event.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{event.city}{event.country ? `, ${event.country}` : ''}</p>
        <p className="text-sm text-[#6d3df5] mt-1">{formatDate(event.start_at, event.timezone)}</p>
      </div>
    </Link>
  );
}
