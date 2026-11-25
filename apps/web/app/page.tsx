export const dynamic = "force-dynamic";
import HeroBanner from '@/components/HeroBanner';
import Link from 'next/link';
import { fetchEvents } from '@/lib/api';

const categories = [
  { name: 'Koncerti', href: '/search?category=koncerti', icon: '🎤' },
  { name: 'Festivali', href: '/search?category=festivali', icon: '🎪' },
  { name: 'Sport', href: '/search?category=sport', icon: '🏆' },
  { name: 'Teatar', href: '/search?category=pozoriste', icon: '🎭' },
  { name: 'Kultura', href: '/search?category=kultura', icon: '🏛️' },
  { name: 'Noćni život', href: '/search?category=nightlife', icon: '🍸' },
  { name: 'Stand-up', href: '/search?category=standup', icon: '🎤' },
  { name: 'Konferencije', href: '/search?category=konferencije', icon: '👥' },
  { name: 'Sve kategorije', href: '/categories', icon: '▦' },
];

function AppStoreBadge() {
  return (
    <a href="#" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-zinc-900 transition border border-zinc-800 shadow-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      <span className="text-left leading-tight">
        <span className="block text-[9px] opacity-80">Preuzmi na</span>
        <span className="block text-sm font-semibold">App Store</span>
      </span>
    </a>
  );
}

function GooglePlayBadge() {
  return (
    <a href="#" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-zinc-900 transition border border-zinc-800 shadow-sm">
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
      <span className="text-left leading-tight">
        <span className="block text-[9px] opacity-80">Dostupno na</span>
        <span className="block text-sm font-semibold">Google Play</span>
      </span>
    </a>
  );
}

export default async function Home() {
  // Real published events only. Empty array if API unavailable or no data.
  const events = await fetchEvents('/events');
  const featured = events.filter(e => e.is_featured).slice(0, 3);
  const upcoming = events.slice(0, 8);

  return (
    <>
      <HeroBanner />

      <section className="bg-[#0a0a1a] border-t border-white/5 py-3">
        <div className="max-w-7xl mx-auto px-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Sigurna kupovina</span>
          <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Digitalne QR ulaznice</span>
          <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Rezervacija bez stvarnog plaćanja (dev)</span>
          <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Podrška 24/7</span>
        </div>
      </section>

      <section className="bg-[#0a0a1a] py-6">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(c => (
              <Link key={c.name} href={c.href} className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 rounded-2xl px-4 py-3 min-w-[84px] transition-all duration-200">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[11px] text-white/70 whitespace-nowrap">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-5">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Istaknuti događaji</h2>
                <p className="text-sm text-zinc-500 mt-1">Stvarni objavljeni događaji</p>
              </div>
              <Link href="/search" className="text-sm text-purple-600 font-medium hover:underline">Pogledaj sve →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map(e => (
                <Link key={e.id} href={`/events/${e.slug}`} className="group relative rounded-2xl overflow-hidden bg-zinc-900 aspect-[16/10] shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  {e.image_url && <img src={e.image_url} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs text-white/70">{new Date(e.start_at).toLocaleDateString('bs-BA')}</p>
                    <p className="font-semibold text-base mt-0.5 leading-tight">{e.title}</p>
                    <p className="text-xs text-white/60 mt-1">{e.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-14 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Nadolazeći događaji</h2>
              <p className="text-sm text-zinc-500 mt-1">{upcoming.length === 0 ? 'Nema objavljenih događaja' : 'Iz baze'}</p>
            </div>
            <Link href="/search" className="text-sm text-purple-600 font-medium hover:underline">Svi događaji →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-zinc-500 text-sm">
              Trenutno nema objavljenih događaja. CMS i organizatori mogu dodati sadržaj.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {upcoming.map(e => (
                <Link key={e.id} href={`/events/${e.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-zinc-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-100">
                    {e.image_url && <img src={e.image_url} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />}
                  </div>
                  <div className="p-3.5">
                    <p className="text-xs text-zinc-500">{new Date(e.start_at).toLocaleDateString('bs-BA')}</p>
                    <p className="font-semibold text-sm mt-1 line-clamp-1">{e.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{e.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Kako radi</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 rounded-2xl border border-zinc-200">
              <div className="text-2xl font-bold text-purple-600">1</div>
              <h3 className="mt-2 font-semibold">Odaberi događaj</h3>
              <p className="mt-1 text-sm text-zinc-500">Pronađi koncert, festival ili sportski događaj.</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-200">
              <div className="text-2xl font-bold text-purple-600">2</div>
              <h3 className="mt-2 font-semibold">Kupi ulaznicu</h3>
              <p className="mt-1 text-sm text-zinc-500">Sigurna kupovina karticom. QR kod stiže na email.</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-200">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <h3 className="mt-2 font-semibold">Dođi i uživaj</h3>
              <p className="mt-1 text-sm text-zinc-500">Pokaži QR na ulazu. Ulaznica je spremna.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-zinc-50">
        <div className="max-w-xl mx-auto px-5 text-center">
          <h2 className="text-xl font-bold">Ostani u toku</h2>
          <p className="mt-2 text-sm text-zinc-500">Prijavi se za novosti o događajima.</p>
          <form className="mt-4 flex gap-2" action="/contact" method="get">
            <input type="email" placeholder="Tvoj email" className="flex-1 border border-zinc-300 rounded-xl px-4 py-3 text-sm" />
            <button className="bg-purple-600 text-white px-5 py-3 rounded-xl text-sm font-medium">Prijavi se</button>
          </form>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Organizuješ događaj?</h2>
            <p className="mt-4 text-white/75 text-lg">Objavi svoj događaj, prodaj ulaznice i dođi do hiljada posjetilaca širom Balkana.</p>
            <Link href="/organizer" className="inline-block mt-6 bg-white text-purple-900 hover:bg-zinc-100 px-7 py-3 rounded-xl font-semibold text-sm shadow-lg">Postani organizator →</Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl font-bold">Balkan Events aplikacija</h2>
          <p className="mt-3 text-zinc-500 text-lg">Svi događaji u tvom džepu.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
          <p className="mt-5 text-xs text-zinc-400">Aplikacija je u razvoju. Dostupna uskoro.</p>
        </div>
      </section>
    </>
  );
}
