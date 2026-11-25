import { fetchEventBySlug, formatDate } from '@/lib/api';
import Link from 'next/link';
import BuyTickets from './BuyTickets';
import { notFound } from 'next/navigation';
import Countdown from '@/components/Countdown';
import ShareButtons from '@/components/ShareButtons';
import Sponsors from '@/components/Sponsors';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) return { title: 'Događaj nije pronađen' };

  const title = `${event.title} – Ulaznice`;
  const description = event.short_description || `Kupi ulaznice za ${event.title}. ${event.city || ''} ${event.venue_name || ''}`.trim();
  const url = `https://balkanevents.org/events/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: event.image_url ? [{ url: event.image_url, width: 1200, height: 630 }] : undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: { canonical: url },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const img = event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80';
  const shareUrl = `https://balkanevents.org/events/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.short_description || event.title,
    startDate: event.start_at,
    endDate: event.end_at || event.start_at,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue_name || event.city || 'Lokacija',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city || '',
        addressCountry: event.country || 'BA',
      },
    },
    image: img,
    organizer: { '@type': 'Organization', name: 'BALKAN EVENTS', url: 'https://balkanevents.org' },
    offers: { '@type': 'Offer', url: shareUrl, availability: 'https://schema.org/InStock', priceCurrency: 'EUR' },
  };

  return (
    <div className="bg-[#f6f5fb] min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative h-[45vh] md:h-[55vh]">
        <img src={img} alt={event.title} className="absolute inset-0 w-full h-full object-cover" loading="eager" />
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

          {event.start_at && <Countdown date={event.start_at} />}

          {event.short_description && (
            <p className="mt-5 text-gray-700 leading-relaxed">{event.short_description}</p>
          )}

          <Sponsors position="EVENT_PAGE" eventId={event.id} title="Sponzori" />

          <div className="mt-4">
            <p className="text-xs text-zinc-500 mb-1">Podijeli događaj</p>
            <ShareButtons title={event.title} url={shareUrl} />
          </div>

          <BuyTickets eventId={event.id} />
          <Link href="/search" className="mt-4 inline-block text-sm text-gray-500 hover:underline">Nazad na pretragu</Link>
        </div>
      </div>
    </div>
  );
}
