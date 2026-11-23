import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0b0b1f] text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-black">BE</span>
            <span className="flex flex-col leading-none">
              <span className="text-[11px] font-bold">BALKAN</span>
              <span className="text-[10px] font-semibold text-zinc-300">EVENTS</span>
            </span>
          </Link>
          <p className="mt-3 text-xs leading-relaxed">Discover. Experience. Connect. Regionalna platforma za događaje i prodaju ulaznica.</p>
        </div>
        <div>
          <p className="text-white font-semibold text-xs tracking-wider mb-3">PLATFORMA</p>
          <div className="space-y-2 text-xs">
            <Link href="/about" className="block hover:text-white">O nama</Link>
            <Link href="/search" className="block hover:text-white">Događaji</Link>
            <Link href="/categories" className="block hover:text-white">Kategorije</Link>
            <Link href="/cities" className="block hover:text-white">Gradovi</Link>
            <Link href="/contact" className="block hover:text-white">Kontakt</Link>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-xs tracking-wider mb-3">ORGANIZATORI</p>
          <div className="space-y-2 text-xs">
            <Link href="/organizer" className="block hover:text-white">Postani organizator</Link>
            <Link href="/organizer-terms" className="block hover:text-white">Uslovi za organizatore</Link>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-xs tracking-wider mb-3">PRAVNE INFORMACIJE</p>
          <div className="space-y-2 text-xs">
            <Link href="/terms" className="block hover:text-white">Uslovi korištenja</Link>
            <Link href="/privacy" className="block hover:text-white">Politika privatnosti</Link>
            <Link href="/refund" className="block hover:text-white">Politika povrata</Link>
            <Link href="/cookies" className="block hover:text-white">Kolačići</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} BALKAN EVENTS. All rights reserved. Owned and operated by BAYA eSIM LLC.
      </div>
    </footer>
  );
}
