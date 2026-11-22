import { fetchEventBySlug, formatDate } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const img = event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80';

  return (
    <div className="bg-[#fafafa] min-h-screen">
      <div className="relative h-[50vh] md:h-[60vh]">
        <img src={img} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-[#0b1020]/40 to-transparent" />
      </div>
      <div className="max-w-4xl mx-auto px-5 -mt-24 relative pb-16">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
          <p className="text-[#C7A76C] text-sm font-medium tracking-wider">DOGAĐAJ</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-display font-semibold text-[#0b1020]">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>{event.city}{event.country ? `, ${event.country}` : ''}</span>
            <span>{formatDate(event.start_at, event.timezone)}</span>
            {event.venue_name && <span>{event.venue_name}</span>}
          </div>
          {event.short_description && (
            <p className="mt-6 text-lg text-gray-700 leading-relaxed">{event.short_description}</p>
          )}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/checkout" className="bg-gradient-to-r from-[#7047EB] to-[#9B6CFF] text-white px-8 py-4 rounded-xl font-medium text-center">
              Kupi ulaznice
            </Link>
            <Link href="/search" className="border border-gray-300 px-8 py-4 rounded-xl text-center">
              Nazad na pretragu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
