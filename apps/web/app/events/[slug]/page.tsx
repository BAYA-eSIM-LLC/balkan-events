import { fetchEventBySlug, formatDate } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const img = event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="bg-[#f6f5fb] min-h-screen">
      <div className="relative h-[45vh] md:h-[55vh]">
        <img src={img} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b1f]/90 via-[#0d0b1f]/30 to-transparent" />
      </div>
      <div className="max-w-3xl mx-auto px-5 -mt-20 relative pb-12">
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <p className="text-[#d4af77] text-xs font-medium tracking-widest">DOGAĐAJ</p>
          <h1 className="mt-2 text-2xl md:text-4xl font-display font-extrabold text-[#0d0b1f]">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="px-3 py-1 bg-gray-100 rounded-full">{event.city}{event.country ? `, ${event.country}` : ''}</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">{formatDate(event.start_at, event.timezone)}</span>
            {event.venue_name && <span className="px-3 py-1 bg-gray-100 rounded-full">{event.venue_name}</span>}
          </div>
          {event.short_description && (
            <p className="mt-5 text-gray-700 leading-relaxed">{event.short_description}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/checkout" className="bg-[#6d3df5] hover:bg-[#7c50ff] text-white px-6 py-3.5 rounded-xl font-medium text-center transition">
              Kupi ulaznice
            </Link>
            <Link href="/search" className="border border-gray-300 px-6 py-3.5 rounded-xl text-center hover:bg-gray-50 transition">
              Nazad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
