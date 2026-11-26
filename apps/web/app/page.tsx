export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchEvents, API } from "@/lib/api";

const categories = [
  { name: "Koncerti", href: "/search?category=koncerti", icon: "🎵" },
  { name: "Festivali", href: "/search?category=festivali", icon: "🎪" },
  { name: "Sport", href: "/search?category=sport", icon: "🏆" },
  { name: "Teatar", href: "/search?category=teatar", icon: "🎭" },
  { name: "Kultura", href: "/search?category=kultura", icon: "🏛️" },
  { name: "Noćni život", href: "/search?category=nightlife", icon: "🍸" },
  { name: "Stand-up", href: "/search?category=standup", icon: "🎤" },
  { name: "Konferencije", href: "/search?category=konferencije", icon: "💼" },
  { name: "Sve kategorije", href: "/categories", icon: "▦" },
];

function fmt(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("bs-BA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
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
  const featured = events.slice(0, 3);
  const upcoming = events.slice(0, 8);
  const prices = await minPrices(events);
  const heroEvent = featured[0];

  return (
    <div className="bg-white text-[#0d0b1f]">
      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden bg-[#070b1c]">
        <img
          src="/hero-festival.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b1c]/75 via-[#070b1c]/40 to-[#070b1c]/10" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-28 pb-16">
          <p className="text-[12px] tracking-[0.28em] text-purple-300 font-semibold">DISCOVER. EXPERIENCE. CONNECT.</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-white leading-[1.05] max-w-xl">
            Najveći događaji<br />na Balkanu
          </h1>
          <p className="mt-4 text-white/80 max-w-md">Koncerti, festivali, sport, teatar i još mnogo toga. Pronađi, rezerviši i doživi najbolje događaje u regionu.</p>

          {heroEvent && (
            <Link href={`/events/${heroEvent.slug}`} className="mt-5 inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-semibold px-5 py-2.5 rounded-full text-sm shadow-lg">
              Ulaznice od {prices[heroEvent.id] ? prices[heroEvent.id].toFixed(2) : ""} EUR →
            </Link>
          )}

          <form action="/search" className="mt-7 flex flex-col sm:flex-row gap-2 max-w-2xl bg-white rounded-2xl p-2 shadow-xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <span className="text-zinc-400">⌕</span>
              <input name="q" placeholder="Pretraži događaje, izvođače ili gradove..." className="w-full py-2.5 text-sm outline-none text-[#0d0b1f]" />
            </div>
            <button type="submit" className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Pretraži</button>
          </form>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {["Sarajevo", "Zagreb", "Beograd", "Ljubuški", "Mostar", "Split"].map((c) => (
              <Link key={c} href={`/search?q=${encodeURIComponent(c)}`} className="shrink-0 text-xs text-white/80 border border-white/20 rounded-full px-3 py-1 hover:bg-white/10">{c}</Link>
            ))}
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {categories.map((c) => (
              <Link key={c.name} href={c.href} className="shrink-0 flex flex-col items-center gap-1.5 w-[76px]">
                <span className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-lg">{c.icon}</span>
                <span className="text-[11px] text-white/80 text-center">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-2xl font-extrabold">Istaknuti događaji</h2>
          <Link href="/search" className="text-sm text-[#7C3AED] font-semibold">Pogledaj sve →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-zinc-500">Trenutno nema objavljenih događaja.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {featured.map((e) => (
              <Link key={e.id} href={`/events/${e.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition">
                <div className="relative aspect-[16/10] bg-zinc-900">
                  <img src={e.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80"} alt="" className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.02] transition duration-500" />
                  <div className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-md">★ FEATURED</div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-zinc-500">{fmt(e.start_at)}</p>
                  <p className="font-bold text-lg leading-tight mt-0.5">{e.title}</p>
                  <p className="text-xs text-zinc-500 mt-1">📍 {[e.city, e.venue_name].filter(Boolean).join(" · ")}</p>
                  {prices[e.id] && <p className="text-sm font-semibold text-[#7C3AED] mt-1.5">od {prices[e.id].toFixed(2)} EUR</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* UPCOMING */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold">Nadolazeći događaji</h2>
          <div className="hidden md:flex gap-2">
            {["Svi", "Koncerti", "Festivali", "Sport", "Teatar"].map((t, i) => (
              <Link key={t} href={i === 0 ? "/search" : `/search?category=${t.toLowerCase()}`} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i === 0 ? "bg-[#7C3AED] text-white" : "bg-zinc-100 text-zinc-600"}`}>{t}</Link>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {upcoming.map((e) => (
            <Link key={e.id} href={`/events/${e.slug}`} className="group">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-zinc-900">
                <img src={e.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=700&q=80"} alt="" className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.02] transition duration-500" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">{fmt(e.start_at)}</p>
              <p className="font-bold leading-tight">{e.title}</p>
              <p className="text-xs text-zinc-500">📍 {[e.city, e.venue_name].filter(Boolean).join(" · ")}</p>
              {prices[e.id] && <p className="text-xs font-semibold text-[#7C3AED] mt-0.5">od {prices[e.id].toFixed(2)} EUR</p>}
            </Link>
          ))}
        </div>
      </section>

      {/* ORGANIZER CTA */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a0a3a] to-[#5b21b6] text-white p-8 md:p-12">
          <div className="max-w-lg relative z-10">
            <h2 className="text-3xl font-extrabold">Organizuješ događaj?</h2>
            <p className="mt-2 text-white/80">Objavi svoj događaj, prodaj ulaznice i dođi do hiljada posjetilaca širom regiona.</p>
            <Link href="/register" className="mt-5 inline-flex bg-white text-[#5b21b6] font-semibold px-5 py-2.5 rounded-full text-sm">Postani organizator →</Link>
          </div>
        </div>
      </section>

      {/* APP */}
      <section className="max-w-7xl mx-auto px-5 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-extrabold">Balkan Events aplikacija</h2>
          <p className="mt-2 text-zinc-600">Svi događaji u tvom džepu. Pretraži, kupi ulaznice i prati omiljene izvođače.</p>
          <ul className="mt-4 space-y-1.5 text-sm text-zinc-700">
            <li>✓ Brza i sigurna kupovina</li>
            <li>✓ Digitalne ulaznice (QR)</li>
            <li>✓ Personalizovane preporuke</li>
            <li>✓ Obavijesti o omiljenim događajima</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <span className="bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-lg">App Store</span>
            <span className="bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-lg">Google Play</span>
          </div>
        </div>
        <div className="relative h-72 flex justify-center">
          <div className="absolute left-1/2 -translate-x-[70%] w-36 h-64 rounded-[2rem] bg-[#0d1020] border-4 border-zinc-800 shadow-2xl overflow-hidden">
            <div className="h-5 bg-zinc-900 flex justify-center"><span className="w-10 h-1.5 bg-zinc-700 rounded-full mt-1" /></div>
            <div className="p-2 text-white text-[8px]">
              <p className="font-bold">ŽELJKO</p>
              <div className="mt-2 h-16 rounded bg-purple-700/60" />
              <p className="mt-1">od 17.90 EUR</p>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-[15%] w-36 h-64 rounded-[2rem] bg-white border-4 border-zinc-800 shadow-2xl overflow-hidden">
            <div className="h-5 bg-zinc-100 flex justify-center"><span className="w-10 h-1.5 bg-zinc-300 rounded-full mt-1" /></div>
            <div className="p-2 text-[8px]">
              <p className="font-bold">Moje ulaznice</p>
              <div className="mt-2 h-20 rounded bg-zinc-100 flex items-center justify-center text-zinc-400">QR</div>
              <p className="mt-1 text-emerald-600 font-semibold">VAŽEĆA</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
