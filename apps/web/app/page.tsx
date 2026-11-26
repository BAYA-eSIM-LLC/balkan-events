export const dynamic = "force-dynamic";
import Link from "next/link";
import { fetchEvents, API } from "@/lib/api";

const categories = [
  { name: "Koncerti", href: "/search?category=koncerti", d: "M9 18V5l12-2v13M9 9l12-2" },
  { name: "Festivali", href: "/search?category=festivali", d: "M4 22h16M6 18l2-8h8l2 8M9 10V6h6v4" },
  { name: "Sport", href: "/search?category=sport", d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M8 22V11h8v11" },
  { name: "Teatar", href: "/search?category=teatar", d: "M4 20V8l8-4 8 4v12M12 4v16" },
  { name: "Kultura", href: "/search?category=kultura", d: "M3 21h18M5 21V9l7-4 7 4v12M9 21v-6h6v6" },
  { name: "Noćni život", href: "/search?category=nightlife", d: "M12 3v2M5 8l1.5 1.5M19 8l-1.5 1.5M12 21a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" },
  { name: "Stand-up", href: "/search?category=standup", d: "M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 12a6 6 0 0 0 12 0M12 18v3" },
  { name: "Konferencije", href: "/search?category=konferencije", d: "M4 7h16v10H4zM8 17v2M16 17v2M2 11h2M20 11h2" },
];

const cities = [
  { name: "Sarajevo", img: "/cities/sarajevo.jpg" },
  { name: "Zagreb", img: "/cities/zagreb.jpg" },
  { name: "Beograd", img: "/cities/beograd.jpg" },
  { name: "Mostar", img: "/cities/mostar.jpg" },
  { name: "Split", img: "/cities/split.jpg" },
];

function fmt(d?: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("bs-BA", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}
function dayMonth(d?: string) {
  if (!d) return { day: "", mon: "" };
  try {
    const dt = new Date(d);
    return {
      day: String(dt.getDate()).padStart(2, "0"),
      mon: dt.toLocaleDateString("bs-BA", { month: "short" }).toUpperCase(),
    };
  } catch { return { day: "", mon: "" }; }
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

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default async function HomePage() {
  const events = await fetchEvents("/events/upcoming");
  const featured = events.slice(0, 3);
  const upcoming = events.slice(0, 8);
  const prices = await minPrices(events);
  const heroEvent = featured[0];

  return (
    <div className="bg-[#F4F6FA] text-[#101B35]">
      {/* HERO */}
      <section className="relative min-h-[72vh] md:min-h-[82vh] flex items-center overflow-hidden bg-[#101B35]">
        <img
          src="/hero-festival.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101B35]/90 via-[#101B35]/55 to-[#101B35]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#101B35]/70 via-transparent to-[#101B35]/30" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 pt-24 pb-12 md:pt-28 md:pb-16">
          <p className="text-[11px] md:text-[12px] tracking-[0.32em] text-[#E5AD54] font-semibold">DISCOVER · EXPERIENCE · CONNECT</p>
          <h1 className="mt-3 text-[2.1rem] sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.05] max-w-xl">
            Najveći događaji<br />na Balkanu
          </h1>
          <p className="mt-4 text-white/85 max-w-md text-[15px] md:text-base">Koncerti, festivali, sport, teatar i još mnogo toga. Pronađi, rezerviši i doživi najbolje događaje u regionu.</p>

          {heroEvent && (
            <Link href={`/events/${heroEvent.slug}`} className="mt-5 inline-flex items-center gap-2 bg-[#E5AD54] hover:bg-[#d49b3f] text-[#101B35] font-bold px-5 py-2.5 rounded-full text-sm shadow-lg">
              Ulaznice od {prices[heroEvent.id] ? prices[heroEvent.id].toFixed(2) : ""} EUR →
            </Link>
          )}

          <form action="/search" className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl bg-white rounded-2xl p-1.5 shadow-2xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <span className="text-[#101B35]/40 text-lg">⌕</span>
              <input name="q" placeholder="Pretraži događaje, izvođače ili gradove..." className="w-full py-3 text-sm outline-none text-[#101B35] bg-transparent" />
            </div>
            <button type="submit" className="bg-[#101B35] hover:bg-[#1a2a4a] text-white font-semibold px-6 py-3 rounded-xl text-sm">Pretraži</button>
          </form>

          <div className="mt-5 flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <Link key={c.name} href={c.href} className="shrink-0 flex flex-col items-center gap-1.5 w-[78px]">
                <span className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center text-[#E5AD54]">
                  <Icon d={c.d} />
                </span>
                <span className="text-[11px] text-white/85 text-center leading-tight">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="max-w-7xl mx-auto px-5 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-[#E5AD54] font-semibold">IZDVAJAMO</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#101B35] mt-1">Istaknuti događaji</h2>
          </div>
          <Link href="/search" className="text-sm text-[#101B35] font-semibold hover:text-[#E5AD54]">Pogledaj sve →</Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-zinc-500">Trenutno nema objavljenih događaja.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {featured.map((e) => {
              const dm = dayMonth(e.start_at);
              return (
                <Link key={e.id} href={`/events/${e.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-[#101B35]/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300">
                  <div className="relative aspect-[16/10] bg-[#101B35]">
                    <img src={e.image_url || "/hero-festival.jpg"} alt="" className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.03] transition duration-500" />
                    <div className="absolute top-3 left-3 bg-[#E5AD54] text-[#101B35] text-[10px] font-bold px-2 py-1 rounded-md tracking-wide">★ FEATURED</div>
                    <div className="absolute top-3 right-3 bg-[#101B35]/90 text-white text-center px-2 py-1 rounded-md min-w-[42px]">
                      <div className="text-[15px] font-extrabold leading-none">{dm.day}</div>
                      <div className="text-[9px] tracking-wider text-[#E5AD54]">{dm.mon}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-lg leading-tight text-[#101B35]">{e.title}</p>
                    <p className="text-xs text-[#101B35]/60 mt-1.5">📍 {[e.city, e.venue_name].filter(Boolean).join(" · ")}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-[#101B35]/50">{fmt(e.start_at)}</p>
                      {prices[e.id] && <p className="text-sm font-bold text-[#E5AD54]">od {prices[e.id].toFixed(2)} EUR</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* UPCOMING */}
      <section className="max-w-7xl mx-auto px-5 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#101B35]">Nadolazeći događaji</h2>
          <div className="hidden md:flex gap-2">
            {["Svi", "Koncerti", "Festivali", "Sport", "Teatar"].map((t, i) => (
              <Link key={t} href={i === 0 ? "/search" : `/search?category=${t.toLowerCase()}`} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${i === 0 ? "bg-[#101B35] text-white" : "bg-white text-[#101B35]/70 border border-[#101B35]/10"}`}>{t}</Link>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {upcoming.map((e) => {
            const dm = dayMonth(e.start_at);
            return (
              <Link key={e.id} href={`/events/${e.slug}`} className="group block bg-white rounded-2xl overflow-hidden border border-[#101B35]/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300">
                <div className="relative aspect-[16/10] bg-[#101B35]">
                  <img src={e.image_url || "/hero-festival.jpg"} alt="" className="absolute inset-0 w-full h-full object-contain group-hover:scale-[1.03] transition duration-500" />
                  <div className="absolute top-2.5 right-2.5 bg-[#101B35]/90 text-white text-center px-1.5 py-0.5 rounded min-w-[36px]">
                    <div className="text-[13px] font-extrabold leading-none">{dm.day}</div>
                    <div className="text-[8px] tracking-wider text-[#E5AD54]">{dm.mon}</div>
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="font-bold leading-tight text-[#101B35]">{e.title}</p>
                  <p className="text-xs text-[#101B35]/55 mt-1">📍 {[e.city, e.venue_name].filter(Boolean).join(" · ")}</p>
                  {prices[e.id] && <p className="text-xs font-bold text-[#E5AD54] mt-1.5">od {prices[e.id].toFixed(2)} EUR</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CITIES */}
      <section className="max-w-7xl mx-auto px-5 pb-14">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-[#E5AD54] font-semibold">DESTINACIJE</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#101B35] mt-1">Gradovi</h2>
          </div>
          <Link href="/cities" className="text-sm text-[#101B35] font-semibold hover:text-[#E5AD54]">Svi gradovi →</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
          {cities.map((c) => (
            <Link key={c.name} href={`/search?q=${encodeURIComponent(c.name)}`} className="shrink-0 w-[160px] md:w-auto group relative rounded-2xl overflow-hidden h-36 md:h-44 shadow-md">
              <img src={c.img} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#101B35]/85 via-[#101B35]/20 to-transparent" />
              <span className="absolute bottom-3 left-3 text-white font-bold text-sm tracking-wide">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ORGANIZER */}
      <section className="max-w-7xl mx-auto px-5 pb-14">
        <div className="relative overflow-hidden rounded-3xl bg-[#101B35] text-white p-7 md:p-12">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#E5AD54]/10" />
          <div className="absolute right-10 bottom-0 w-40 h-40 rounded-full bg-[#E5AD54]/5" />
          <div className="max-w-lg relative z-10">
            <p className="text-[11px] tracking-[0.22em] text-[#E5AD54] font-semibold">ZA ORGANIZATORE</p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">Organizuješ<br />događaj?</h2>
            <p className="mt-3 text-white/75">Objavi svoj događaj, prodaj ulaznice i dođi do hiljada posjetilaca širom regiona.</p>
            <Link href="/register" className="mt-6 inline-flex bg-[#E5AD54] text-[#101B35] font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#d49b3f]">Postani organizator →</Link>
          </div>
        </div>
      </section>

      {/* APP */}
      <section className="max-w-7xl mx-auto px-5 pb-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-[#E5AD54] font-semibold">MOBILNO</p>
          <h2 className="mt-1 text-3xl font-extrabold text-[#101B35]">Balkan Events na telefonu</h2>
          <p className="mt-2 text-[#101B35]/70">Web radi sada. Mobilna aplikacija je u razvoju — uskoro u App Store i Google Play.</p>
          <ul className="mt-4 space-y-2 text-sm text-[#101B35]/80">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E5AD54]" />Brza i sigurna kupovina</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E5AD54]" />Digitalne ulaznice (QR)</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E5AD54]" />Skeniranje za organizatore</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E5AD54]" />Obavijesti o omiljenim događajima</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <span className="bg-[#101B35] text-white text-xs font-semibold px-4 py-2.5 rounded-lg opacity-70">App Store · Uskoro</span>
            <span className="bg-[#101B35] text-white text-xs font-semibold px-4 py-2.5 rounded-lg opacity-70">Google Play · Uskoro</span>
          </div>
        </div>
        <div className="relative h-72 flex justify-center">
          <div className="absolute left-1/2 -translate-x-[70%] w-36 h-64 rounded-[2rem] bg-[#101B35] border-4 border-[#101B35] shadow-2xl overflow-hidden">
            <div className="h-5 bg-black/40 flex justify-center"><span className="w-10 h-1.5 bg-white/20 rounded-full mt-1" /></div>
            <div className="p-2.5 text-white text-[9px]">
              <p className="font-bold text-[#E5AD54]">ŽELJKO</p>
              <div className="mt-2 h-16 rounded bg-white/10" />
              <p className="mt-1.5">od 17.90 EUR</p>
            </div>
          </div>
          <div className="absolute left-1/2 -translate-x-[15%] w-36 h-64 rounded-[2rem] bg-white border-4 border-[#101B35] shadow-2xl overflow-hidden">
            <div className="h-5 bg-[#F4F6FA] flex justify-center"><span className="w-10 h-1.5 bg-[#101B35]/20 rounded-full mt-1" /></div>
            <div className="p-2.5 text-[9px]">
              <p className="font-bold text-[#101B35]">Moje ulaznice</p>
              <div className="mt-2 h-20 rounded bg-[#F4F6FA] flex items-center justify-center text-[#101B35]/40">QR</div>
              <p className="mt-1.5 text-emerald-600 font-semibold">VAŽEĆA</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
