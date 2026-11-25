export const dynamic = "force-dynamic";
import HeroBanner from '@/components/HeroBanner';
import Sponsors from '@/components/Sponsors';
import Link from 'next/link';
import { fetchEvents, API } from '@/lib/api';
import { IconConcert, IconFestival, IconSport, IconTheater, IconCulture, IconNight, IconMic, IconBrief, IconMore, IconTicket, IconShield, IconPhone, IconHeadset } from '@/components/Icons';

const categories = [
  { name: 'Koncerti', href: '/search?category=koncerti', Icon: IconConcert },
  { name: 'Festivali', href: '/search?category=festivali', Icon: IconFestival },
  { name: 'Sport', href: '/search?category=sport', Icon: IconSport },
  { name: 'Teatar', href: '/search?category=pozoriste', Icon: IconTheater },
  { name: 'Kultura', href: '/search?category=kultura', Icon: IconCulture },
  { name: 'Noćni život', href: '/search?category=nightlife', Icon: IconNight },
  { name: 'Stand-up', href: '/search?category=standup', Icon: IconMic },
  { name: 'Konferencije', href: '/search?category=konferencije', Icon: IconBrief },
  { name: 'Više', href: '/categories', Icon: IconMore },
];

const cities = [
  { name: 'Sarajevo', href: '/search?city=Sarajevo' },
  { name: 'Zagreb', href: '/search?city=Zagreb' },
  { name: 'Beograd', href: '/search?city=Beograd' },
  { name: 'Mostar', href: '/search?city=Mostar' },
  { name: 'Split', href: '/search?city=Split' },
  { name: 'Ljubljana', href: '/search?city=Ljubljana' },
];

async function getMinPrice(eventId: number): Promise<{ price: number; currency: string; low: boolean } | null> {
  try {
    const r = await fetch(`${API}/events/${eventId}/ticket-types`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    const types = await r.json();
    if (!Array.isArray(types) || !types.length) return null;
    const prices = types.map((t: any) => Number(t.price)).filter((n: number) => !isNaN(n));
    const avail = types.reduce((s: number, t: any) => s + (Number(t.available) || 0), 0);
    if (!prices.length) return null;
    return { price: Math.min(...prices), currency: types[0].currency || 'EUR', low: avail > 0 && avail <= 20 };
  } catch { return null; }
}

function AppStoreBadge() {
  return (
    <a href="#" className="inline-flex items-center gap-2 bg-black/40 backdrop-blur border border-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/10 transition">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      <span className="text-left leading-tight">
        <span className="block text-[9px] opacity-70">Preuzmi na</span>
        <span className="block text-sm font-semibold">App Store</span>
      </span>
    </a>
  );
}

function GooglePlayBadge() {
  return (
    <a href="#" className="inline-flex items-center gap-2 bg-black/40 backdrop-blur border border-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/10 transition">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
      <span className="text-left leading-tight">
        <span className="block text-[9px] opacity-70">Dostupno na</span>
        <span className="block text-sm font-semibold">Google Play</span>
      </span>
    </a>
  );
}

export default async function HomePage() {
  const events = await fetchEvents('/events?status=PUBLISHED&limit=12');
  const featured = events.filter(e => e.is_featured).slice(0, 4);
  const display = featured.length ? featured : events.slice(0, 4);

  const withPrice = await Promise.all(display.map(async e => ({
    ...e,
    pricing: await getMinPrice(e.id),
  })));

  return (
    <div className="bg-[#10152B] text-white min-h-screen">
      <HeroBanner />

      {/* City chips */}
      <section className="pt-6 pb-2">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {cities.map(c => (
              <Link key={c.name} href={c.href} className="flex-shrink-0 px-4 py-2 rounded-full bg-[#1a1635] border border-white/10 text-sm text-zinc-300 hover:border-[#7C3AED] hover:text-white hover:bg-[#7C3AED]/20 transition-all duration-200">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative mt-4 z-10">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
            {categories.map((c, i) => (
              <Link
                key={c.name}
                href={c.href}
                className={`flex-shrink-0 flex flex-col items-center gap-2 rounded-2xl px-5 py-4 min-w-[88px] transition-all duration-200 border ${
                  i === 0
                    ? 'bg-gradient-to-br from-[#7C3AED] to-[#A020F0] border-transparent text-white shadow-lg shadow-purple-500/40 scale-105'
                    : 'bg-[#1a1635] border-white/10 text-zinc-300 hover-lift hover:border-[#7C3AED]/50 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105'
                }`}
              >
                <c.Icon className="w-6 h-6" />
                <span className="text-xs font-medium whitespace-nowrap">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {withPrice.length > 0 && (
        <section className="py-14">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1 h-6 bg-gradient-to-b from-[#7C3AED] to-[#FF6B9D] rounded-full" />
                <h2 className="text-2xl md:text-3xl font-bold">Izdvojeni događaji</h2>
              </div>
              <Link href="/search" className="text-sm text-[#A78BFA] hover:text-white font-medium">Pogledaj sve događaje →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {withPrice.map(e => (
                <Link key={e.id} href={`/events/${e.slug}`} className="group relative rounded-2xl overflow-hidden bg-[#1a1635] border border-white/10 hover-lift hover:border-[#7C3AED]/50 card-contain">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {e.image_url ? (
                      <img src={e.image_url} alt={e.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover img-zoom" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED]/40 to-[#15112F]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10152B] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-[11px] font-bold px-2 py-1 rounded-lg tracking-wide">
                        {new Date(e.start_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                      </span>
                      {e.pricing && e.pricing.price === 0 ? null : null}
                      {new Date(e.start_at) > new Date(Date.now() + 30*864e5) && (
                        <span className="absolute top-3 right-12 text-[10px] font-bold uppercase tracking-wider bg-[#A78BFA]/90 text-white px-2 py-1 rounded-full">Uskoro</span>
                      )}
                    {e.pricing?.low && (
                      <span className="absolute top-12 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#FF6B9D] text-white px-2 py-1 rounded-full">Posljednje</span>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white/70 hover:text-[#FF6B9D] hover:scale-110 transition-all duration-200 group-hover:bg-black/60" aria-label="Favorit">
                      <svg className="w-4 h-4 group-hover:fill-[#FF6B9D]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-base leading-tight line-clamp-2 group-hover:text-[#A78BFA] transition">{e.title}</p>
                    <p className="text-xs text-zinc-300 mt-1.5 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      {e.venue_name || e.city || 'Lokacija'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(e.start_at).toLocaleDateString('bs-BA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      {e.pricing ? (
                        <span className="text-sm font-bold text-white">od {e.pricing.price.toFixed(2)} {e.pricing.currency}</span>
                      ) : <span />}
                      <span className="text-xs font-semibold bg-gradient-to-r from-[#7C3AED] to-[#A020F0] text-white px-3 py-1.5 rounded-full group-hover:shadow-lg group-hover:shadow-purple-500/40 transition-all">
                        Kupi →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust bar */}
      <section className="py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { Icon: IconTicket, title: 'Brza i sigurna kupovina', sub: 'Ulaznice za par sekundi' },
            { Icon: IconShield, title: 'Provjereni događaji', sub: 'Direktno od organizatora' },
            { Icon: IconPhone, title: 'Digitalna ulaznica', sub: 'QR kod u aplikaciji' },
            { Icon: IconHeadset, title: 'Podrška 24/7', sub: 'Uvijek uz tebe' },
          ].map(t => (
            <div key={t.title} className="flex flex-col items-center gap-1.5 group">
              <t.Icon className="w-6 h-6 text-[#A78BFA] group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-white">{t.title}</p>
              <p className="text-xs text-zinc-300">{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 bg-[#15112F]">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Kako funkcioniše</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6 text-left">
            {[
              { n: '1', t: 'Odaberi događaj', d: 'Pronađi koncert, festival ili sportski događaj.' },
              { n: '2', t: 'Kupi ulaznicu', d: 'Sigurna kupovina karticom. QR kod stiže na email.' },
              { n: '3', t: 'Dođi i uživaj', d: 'Pokaži QR na ulazu. Ulaznica je spremna.' },
            ].map(s => (
              <div key={s.n} className="p-6 rounded-2xl bg-[#10152B] border border-white/10 hover-lift hover:border-[#7C3AED]/40">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A020F0] flex items-center justify-center font-bold text-sm">{s.n}</div>
                <h3 className="mt-4 font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-zinc-300">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Sponsors position="HOMEPAGE" title="Naši sponzori" />

      {/* Organizer CTA */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-5">
          <div className="rounded-3xl bg-gradient-to-br from-[#7C3AED]/20 to-[#FF6B9D]/10 border border-white/10 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 hover:border-[#7C3AED]/30 transition">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">Organizuješ događaj?</h2>
              <p className="mt-4 text-white/70 text-lg">Objavi svoj događaj, prodaj ulaznice i dođi do hiljada posjetilaca širom Balkana.</p>
              <Link href="/organizer" className="inline-block mt-6 bg-white text-[#10152B] hover:bg-zinc-100 hover:shadow-xl px-7 py-3 rounded-full font-semibold text-sm transition-all">Postani organizator →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* App */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold">Balkan Events aplikacija</h2>
          <p className="mt-3 text-zinc-300 text-lg">Svi događaji u tvom džepu.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
          <p className="mt-5 text-xs text-zinc-400">Aplikacija je u razvoju. Dostupna uskoro.</p>
        </div>
      </section>
    </div>
  );
}
