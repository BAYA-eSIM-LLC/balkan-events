import { fetchEventBySlug, formatDate } from '@/lib/api';
import Link from 'next/link';
import BuyTickets from './BuyTickets';
import { notFound } from 'next/navigation';
import Countdown from '@/components/Countdown';
import ShareButtons from '@/components/ShareButtons';
import Sponsors from '@/components/Sponsors';
import type { Metadata } from 'next';

const EVENT_VIDEOS: Record<string, string> = {
  'zeljko-joksimovic-ljubuski': 'TVmIAwSrT78',
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) return { title: 'Događaj nije pronađen' };
  const title = `${event.title} – Ulaznice`;
  const description = event.short_description || `Kupi ulaznice za ${event.title}. ${event.city || ''} ${event.venue_name || ''}`.trim();
  const url = `https://balkanevents.org/events/${slug}`;
  return {
    title, description,
    openGraph: { title, description, url, type: 'website', images: event.image_url ? [{ url: event.image_url, width: 1200, height: 630 }] : undefined },
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
  const videoId = EVENT_VIDEOS[slug];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Event',
    name: event.title, description: event.short_description || event.title,
    startDate: event.start_at, endDate: event.end_at || event.start_at,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: event.venue_name || event.city || 'Lokacija', address: { '@type': 'PostalAddress', addressLocality: event.city || '', addressCountry: event.country || 'BA' } },
    image: img, organizer: { '@type': 'Organization', name: 'BALKAN EVENTS', url: 'https://balkanevents.org' },
    offers: { '@type': 'Offer', url: shareUrl, availability: 'https://schema.org/InStock', priceCurrency: 'EUR' },
  };

  return (
    <div className="bg-[#f6f5fb] min-h-screen pb-24 md:pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative h-[62vh] md:h-[72vh] bg-[#0d0b1f]">
        <img src={img} alt={event.title} className="absolute inset-0 w-full h-full object-contain object-top" loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b1f] via-[#0d0b1f]/50 to-transparent" />
      </div>
      <div className="max-w-3xl mx-auto px-5 -mt-10 relative">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
          <p className="text-[#7C3AED] text-xs font-semibold tracking-widest uppercase">Događaj</p>
          <h1 className="mt-2 text-3xl md:text-5xl font-extrabold text-[#0d0b1f] leading-tight tracking-tight">{event.title}</h1>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            {event.city && <span className="px-3 py-1.5 bg-[#f6f5fb] text-zinc-700 rounded-full font-medium">{event.city}{event.country ? `, ${event.country}` : ''}</span>}
            <span className="px-3 py-1.5 bg-[#f6f5fb] text-zinc-700 rounded-full font-medium">{formatDate(event.start_at, event.timezone)}</span>
            {event.venue_name && <span className="px-3 py-1.5 bg-[#f6f5fb] text-zinc-700 rounded-full font-medium">{event.venue_name}</span>}
          </div>
          {event.start_at && <Countdown date={event.start_at} />}
          {event.short_description && <p className="mt-6 text-zinc-700 leading-relaxed text-base">{event.short_description}</p>}
          {(event.performers?.length ?? 0) > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#0d0b1f] mb-3">Izvođači</h2>
              <div className="space-y-4">
                {(event.performers ?? []).map((pf: any) => (
                  <div key={pf.id} className="flex gap-4 p-4 bg-[#f6f5fb] rounded-2xl">
                    {pf.image_url && <img src={pf.image_url} alt={pf.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />}
                    <div>
                      <p className="text-xs text-[#7C3AED] font-semibold uppercase">{pf.role || 'Izvođač'}</p>
                      <p className="font-bold text-[#0d0b1f]">{pf.name}</p>
                      {pf.bio && <p className="mt-1 text-sm text-zinc-600 leading-relaxed">{pf.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {videoId && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#0d0b1f] mb-3">Video</h2>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={`${event.title} video`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <Sponsors position="EVENT_PAGE" eventId={event.id} title="Sponzori" />
          <div className="mt-6">
            <p className="text-xs text-zinc-500 mb-2 font-medium">Podijeli</p>
            <ShareButtons title={event.title} url={shareUrl} />
          </div>
          <div id="buy" className="mt-8">
            <h2 className="text-lg font-bold text-[#0d0b1f] mb-3">Ulaznice</h2>
            <Link href={`/events/${slug}/seats`} className="mb-4 inline-flex items-center gap-2 bg-[#101B35] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1a2a4a]">
              Odaberi sjedište na mapi →
            </Link>
            <BuyTickets eventId={event.id} />
          </div>
          <Link href="/search" className="mt-6 inline-block text-sm text-zinc-500 hover:text-[#7C3AED]">← Nazad na događaje</Link>
        </div>
      </div>
      <a href="#buy" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0b1f] text-white px-5 py-3 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
        <span className="text-sm font-medium text-zinc-300">Ulaznice</span>
        <span className="bg-gradient-to-r from-[#7C3AED] to-[#A020F0] px-5 py-2.5 rounded-full text-sm font-semibold animate-pulse">Kupi</span>
      </a>
    </div>
  );
}
