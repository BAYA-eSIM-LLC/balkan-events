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

export default async function HomePage() {
  const events = await fetchEvents("/events/upcoming");
  const featured = events.slice(0, 3);
  const upcoming = events.slice(0, 8);

  return (
    <div className="bg-white text-[#0d0b1f]">
      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden bg-[#070b1c]">
        <img
          src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b1c]/70 via-[#070b1c]/30 to-transparent" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-28 pb-16">
          <p className="text-[12px] tracking-[0.28em] text-purple-300 font-semibold">DISCOVER. EXPERIENCE. CONNECT.</p>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold text-white leading-[1.05] max-w-xl">
            Najveći događaji<br />na Balkanu
          </h1>
          <p className="mt-4 text-white/80 max-w-md">Koncerti, festivali, sport, teatar i još mnogo toga. Pronađi, rezerviši i doživi najbolje događaje u regionu.</p>

          <form action="/search" className="mt-7 flex flex-col sm:flex-row gap-2 max-w-2xl bg-white rounded-2xl p-2 shadow-xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <span className="text-zinc-400">⌕</span>
              <input name="q" placeholder="Pretraži događaje, izvođače ili gradove..." className="w-full py-2.5 text-sm outline-none text-[#0d0b1f]" />
            </div>
            <button type="submit" className="bg-[#7C3AED] hover:bg-[#6d28d9] text-white font-semibold px-6 py-2.5 rounded-xl text-sm">Pretraži</button>
          </form>

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
              <Link key={e.id} href={`/events/${e.slug}`} className="group relative rounded-2xl overflow-hidden h-64 shadow-lg">
                <img src={e.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80"} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-amber-400 text-black text-[10px] font-bold px-2 py-1 rounded-md">★ FEATURED</div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-xs opacity-80">{fmt(e.start_at)}</p>
                  <p className="font-bold text-lg leading-tight">{e.title}</p>
                  <p className="text-xs opacity-80 mt-1">📍 {e.city}{e.venue_name ? `, ${e.venue_name}` : ""}</p>
                </div>
                <span className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">→</span>
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
              <div className="rounded-2xl overflow-hidden h-40 bg-zinc-100">
                <img src={e.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=700&q=80"} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <p className="mt-2 text-xs text-zinc-500">{fmt(e.start_at)}</p>
              <p className="font-bold leading-tight">{e.title}</p>
              <p className="text-xs text-zinc-500">📍 {e.city}</p>
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
      <section className="max-w-7xl mx-auto px-5 pb-16 grid md:grid-cols-2 gap-8 items-center">
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
      </section>
    </div>
  );
}
