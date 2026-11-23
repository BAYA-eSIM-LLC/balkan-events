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

function EmptyEvents({ title }: { title: string }) {
  return (
    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-12 text-center">
      <p className="text-zinc-500">{title}</p>
      <Link href="/search" className="inline-block mt-4 text-purple-600 text-sm font-medium hover:underline">Pogledaj sve →</Link>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HeroBanner />

      <section className="bg-[#0a0a1a] py-6">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(c => (
              <Link key={c.name} href={c.href} className="flex-shrink-0 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-4 min-w-[90px] transition">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs text-white/80 whitespace-nowrap">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Istaknuti događaji</h2>
            <Link href="/search" className="text-sm text-purple-600 hover:underline">Pogledaj sve →</Link>
          </div>
          <EmptyEvents title="Događaji će biti prikazani čim budu dostupni u sistemu." />
        </div>
      </section>

      <section className="py-14 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-5">
          <h2 className="text-2xl font-bold mb-6">Nadolazeći događaji</h2>
          <EmptyEvents title="Nadolazeći događaji će se pojaviti ovdje." />
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-bold">Organizuješ događaj?</h2>
            <p className="mt-3 text-white/80">Objavi svoj događaj, prodaj ulaznice i dođi do hiljada posjetilaca širom regije.</p>
            <Link href="/organizer" className="inline-block mt-6 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-xl font-semibold text-sm">Postani organizator →</Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <h2 className="text-2xl font-bold">Balkan Events aplikacija</h2>
          <p className="mt-3 text-zinc-500 max-w-md mx-auto">Svi događaji u tvom džepu. Pretraži, kupi ulaznice i prati omiljene izvođače.</p>
          <p className="mt-6 text-sm text-zinc-400">Mobilna aplikacija je u razvoju. Dostupna uskoro na App Store i Google Play.</p>
        </div>
      </section>
    </>
  );
}
