import { fetchEventBySlug, formatDate } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  return { title: event?.title || 'Događaj', description: event?.short_description };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await fetchEventBySlug(slug);
  if (!event) notFound();

  const hero = event.image_url || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=80';

  return (
    <article className="bg-white">
      <div className="relative h-[420px] md:h-[520px] bg-navy">
        <img src={hero} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020] via-[#0B1020]/60 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-12">
          {event.is_featured && <span className="inline-block mb-3 text-xs font-semibold tracking-wider text-gold bg-gold/20 px-3 py-1 rounded-full w-fit">ISTAKNUTO</span>}
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight max-w-3xl">{event.title}</h1>
          <p className="mt-3 text-lg text-gray-200">{event.city}{event.country ? `, ${event.country}` : ''} · {formatDate(event.start_at, event.timezone)}</p>
          {event.venue_name && <p className="text-sm text-gray-300 mt-1">{event.venue_name}</p>}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {event.short_description && <p className="text-xl text-gray-700 leading-relaxed">{event.short_description}</p>}
          <div className="prose max-w-none text-gray-600">
            <p>Detaljan opis događaja dolazi iz API-ja kada je dostupan.</p>
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/search"><Button variant="secondary">Nazad na pretragu</Button></Link>
            <button className="text-violet-600 text-sm font-medium">Dodaj u favorite</button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit bg-gray-50 border border-gray-100 rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Ulaznice</h2>
          <p className="text-sm text-gray-500 mb-6">Kupovina je trenutno u testnom režimu. Stvarna naplata nije aktivna.</p>
          <Link href={`/checkout?event=${event.slug}`}>
            <Button className="w-full btn-gradient text-white">Kupi ulaznicu (test)</Button>
          </Link>
          <p className="text-xs text-gray-400 mt-4 text-center">QR ulaznica će biti dostupna nakon potvrde.</p>
        </aside>
      </div>
    </article>
  );
}
