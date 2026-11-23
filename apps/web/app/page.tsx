import HeroBanner from '@/components/HeroBanner';
import Link from 'next/link';

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

const featured = [
  { title: 'Gibonni – Live', date: 'Sub, 12. jul 2025.', city: 'Sarajevo, Zetra', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80', featured: true },
  { title: 'Festival EXIT', date: 'Čet, 10. jul – Ned, 13. jul 2025.', city: 'Novi Sad, Petrovaradinska tvrđava', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=600&q=80' },
  { title: 'FK Sarajevo – FK Željezničar', date: 'Ned, 20. jul 2025.', city: 'Sarajevo, Stadion Asim Ferhatović', img: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80' },
];

const upcoming = [
  { title: 'Balkan Music Night', date: 'Pet, 18. jul 2025.', city: 'Zagreb, Arena Zagreb', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80' },
  { title: 'Hamlet – predstava', date: 'Uto, 22. jul 2025.', city: 'Beograd, Narodno pozorište', img: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=400&q=80' },
  { title: 'Summer Beats Festival', date: 'Sub, 26. jul 2025.', city: 'Split, Park Mladeži', img: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=400&q=80' },
  { title: 'Regionalna liga – Finale', date: 'Ned, 27. jul 2025.', city: 'Ljubljana, Stožice', img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=400&q=80' },
];

export default function Home() {
  return (
    <>
      <HeroBanner />

      <section className="bg-[#0a0a1a] py-5">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(c => (
              <Link key={c.name} href={c.href} className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 min-w-[80px] transition">
                <span className="text-xl">{c.icon}</span>
                <span className="text-[11px] text-white/70 whitespace-nowrap">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Istaknuti događaji</h2>
            <Link href="/search" className="text-sm text-purple-600">Pogledaj sve →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map(e => (
              <Link key={e.title} href="/search" className="group relative rounded-xl overflow-hidden bg-zinc-900 aspect-[16/10]">
                <img src={e.img} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {e.featured && <span className="absolute top-3 left-3 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded">FEATURED</span>}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs text-white/70">{e.date}</p>
                  <p className="font-semibold text-sm mt-0.5">{e.title}</p>
                  <p className="text-xs text-white/60 mt-0.5">{e.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Nadolazeći događaji</h2>
            <div className="hidden sm:flex gap-2 text-xs">
              {['Svi', 'Koncerti', 'Festivali', 'Sport', 'Teatar', 'Kultura'].map(f => (
                <Link key={f} href="/search" className="px-3 py-1 rounded-full bg-white border border-zinc-200 hover:border-purple-400">{f}</Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {upcoming.map(e => (
              <Link key={e.title} href="/search" className="group bg-white rounded-xl overflow-hidden border border-zinc-200 hover:shadow-lg transition">
                <div className="aspect-[4/3] relative">
                  <img src={e.img} alt={e.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-zinc-500">{e.date}</p>
                  <p className="font-semibold text-sm mt-1 line-clamp-1">{e.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{e.city}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-gradient-to-r from-indigo-950 to-purple-950 text-white">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold">Organizuješ događaj?</h2>
            <p className="mt-3 text-white/70">Objavi svoj događaj, prodaj ulaznice i dođi do hiljada posjetilaca širom regije.</p>
            <Link href="/organizer" className="inline-block mt-5 bg-purple-500 hover:bg-purple-600 px-6 py-2.5 rounded-lg font-semibold text-sm">Postani organizator →</Link>
          </div>
          <div className="w-full md:w-96">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" alt="Dashboard" className="rounded-xl border border-white/10" />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-2xl font-bold">Balkan Events aplikacija</h2>
          <p className="mt-3 text-zinc-500">Svi događaji u tvom džepu. Pretraži, kupi ulaznice i prati omiljene izvođače.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-zinc-600">
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Brza i sigurna kupovina</span>
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Digitalne ulaznice (QR)</span>
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Personalizovane preporuke</span>
            <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Obavijesti o omiljenim događajima</span>
          </div>
          <p className="mt-6 text-xs text-zinc-400">Mobilna aplikacija je u razvoju. Dostupna uskoro.</p>
        </div>
      </section>
    </>
  );
}
