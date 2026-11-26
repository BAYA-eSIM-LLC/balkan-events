export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchEvents, API } from "@/lib/api";

const categories = [
  { name: "Koncerti", href: "/search?category=koncerti" },
  { name: "Festivali", href: "/search?category=festivali" },
  { name: "Sport", href: "/search?category=sport" },
  { name: "Teatar", href: "/search?category=teatar" },
  { name: "Kultura", href: "/search?category=kultura" },
  { name: "Noćni život", href: "/search?category=nightlife" },
];

function fmt(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("bs-BA", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

async function minPrices(events: {id: number}[]) {
  const out: Record<number, number> = {};
  await Promise.all(events.map(async (e) => {
    try {
      const r = await fetch(`${API}/events/${e.id}/ticket-types`, { cache: "no-store" });
      if (!r.ok) return;
      const types = await r.json();
      const prices = (types || []).map((x: {price: number}) => Number(x.price)).filter((n: number) => n > 0);
      if (prices.length) out[e.id] = Math.min(...prices);
    } catch {}
  }));
  return out;
}

export default async function HomePage() {
  const events = await fetchEvents("/events/upcoming");
  const featured = events.slice(0, 6);
  const prices = await minPrices(events);
  const heroEvent = events[0];

  return (
    <div className="bg-[#FAF7F2] min-h-screen pb-24">
      {/* SEARCH BAR */}
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <form action="/search" className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </span>
          <input
            name="q"
            placeholder="Pretraži događaje, izvođače, gradove..."
            className="w-full bg-white rounded-full pl-12 pr-5 py-3.5 text-sm shadow-sm border border-[#eee] outline-none focus:border-[#FF6B35] transition"
          />
        </form>
      </div>

      {/* PROMO BANNER */}
      <div className="max-w-2xl mx-auto px-4 mt-5">
        <div className="relative rounded-3xl overflow-hidden bg-[#1a1a2e] text-white shadow-lg">
          <img
            src="/hero-festival.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative z-10 p-6 md:p-8">
            <p className="text-2xl md:text-3xl font-extrabold leading-tight">
              Uživaj u najboljim<br />događajima na<br />
              <span className="text-[#FF6B35]">Balkanu</span>
            </p>
            <p className="mt-2 text-sm text-white/80">Koncerti · Festivali · Sport · Kultura</p>
            {heroEvent && (
              <Link href={`/events/${heroEvent.slug}`} className="mt-4 inline-flex items-center gap-1 bg-[#FF6B35] hover:bg-[#e85d2a] text-white font-semibold px-5 py-2.5 rounded-full text-sm">
                Ulaznice od {prices[heroEvent.id] ? prices[heroEvent.id].toFixed(2) : "17.90"} € →
              </Link>
            )}
          </div>
          <div className="absolute top-4 right-4 bg-[#FF6B35] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">-25%</div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="flex gap-6 border-b border-[#e8e4df] overflow-x-auto scrollbar-hide">
          <Link href="/" className="pb-3 text-sm font-bold border-b-2 border-[#FF6B35] text-[#1a1a1a] whitespace-nowrap">Popularni</Link>
          <Link href="/search" className="pb-3 text-sm font-medium text-[#888] hover:text-[#1a1a1a] whitespace-nowrap">Uskoro</Link>
          <Link href="/cities" className="pb-3 text-sm font-medium text-[#888] hover:text-[#1a1a1a] whitespace-nowrap">Po gradovima</Link>
          <Link href="/categories" className="pb-3 text-sm font-medium text-[#888] hover:text-[#1a1a1a] whitespace-nowrap">Kategorije</Link>
        </div>
        <p className="mt-3 text-sm text-[#666]">Istraži najpopularnije događaje — ulaznice već od prikazane cijene.</p>
      </div>

      {/* EVENT CARDS */}
      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-3">
        {featured.length === 0 ? (
          <p className="text-center text-[#888] py-8">Trenutno nema objavljenih događaja.</p>
        ) : (
          featured.map((e) => (
            <Link key={e.id} href={`/events/${e.slug}`} className="flex items-center gap-4 bg-white rounded-2xl p-3 shadow-sm border border-[#f0ebe5] hover:shadow-md transition">
              <img
                src={e.image_url || "/hero-festival.jpg"}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1a1a1a] leading-tight truncate">{e.title}</p>
                <p className="text-xs text-[#888] mt-0.5 flex items-center gap-1">
                  <span>📅</span> {fmt(e.start_at)}
                </p>
                <p className="text-xs text-[#888] flex items-center gap-1">
                  <span>📍</span> {e.city || e.venue_name || "Lokacija"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {prices[e.id] && <p className="text-xs text-[#888]">od <span className="font-bold text-[#1a1a1a]">{prices[e.id].toFixed(2)} €</span></p>}
                <span className="mt-1 inline-block bg-[#FF6B35] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Kupi ulaznicu →</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* CATEGORIES */}
      <div className="max-w-2xl mx-auto px-4 mt-8">
        <h2 className="font-bold text-lg mb-3">Kategorije</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((c) => (
            <Link key={c.name} href={c.href} className="shrink-0 bg-white border border-[#eee] rounded-full px-4 py-2 text-sm font-medium hover:border-[#FF6B35] hover:text-[#FF6B35] transition">
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#eee] px-2 py-2 flex justify-around md:hidden">
        <Link href="/" className="flex flex-col items-center text-[#FF6B35]">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          <span className="text-[10px] font-medium mt-0.5">Početna</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center text-[#888]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
          <span className="text-[10px] font-medium mt-0.5">Događaji</span>
        </Link>
        <Link href="/my-tickets" className="flex flex-col items-center text-[#888]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-medium mt-0.5">Moje ulaznice</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-[#888]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span className="text-[10px] font-medium mt-0.5">Profil</span>
        </Link>
      </nav>
    </div>
  );
}
