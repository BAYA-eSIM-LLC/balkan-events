import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0a0a1a] text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="w-8 h-8 bg-[#e11d48] rounded-lg flex items-center justify-center text-xs font-black">BE</span>
            BALKAN EVENTS
          </div>
          <p className="mt-3 text-xs text-zinc-500 max-w-xs">Discover. Experience. Connect. Regionalna platforma za događaje i prodaju ulaznica.</p>
        </div>
        <div>
          <p className="font-medium text-white mb-3 text-xs uppercase tracking-wide">Platforma</p>
          <Link href="/about" className="block py-1 text-xs hover:text-white">O nama</Link>
          <Link href="/search" className="block py-1 text-xs hover:text-white">Događaji</Link>
          <Link href="/categories" className="block py-1 text-xs hover:text-white">Kategorije</Link>
          <Link href="/cities" className="block py-1 text-xs hover:text-white">Gradovi</Link>
          <Link href="/support" className="block py-1 text-xs hover:text-white">Kontakt</Link>
        </div>
        <div>
          <p className="font-medium text-white mb-3 text-xs uppercase tracking-wide">Organizatori</p>
          <Link href="/organizer" className="block py-1 text-xs hover:text-white">Postani organizator</Link>
          <Link href="/organizer-terms" className="block py-1 text-xs hover:text-white">Uslovi za organizatore</Link>
        </div>
        <div>
          <p className="font-medium text-white mb-3 text-xs uppercase tracking-wide">Pravne informacije</p>
          <Link href="/terms" className="block py-1 text-xs hover:text-white">Uslovi korištenja</Link>
          <Link href="/privacy" className="block py-1 text-xs hover:text-white">Politika privatnosti</Link>
          <Link href="/refund" className="block py-1 text-xs hover:text-white">Politika povrata</Link>
          <Link href="/cookies" className="block py-1 text-xs hover:text-white">Kolačići</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} BALKAN EVENTS. All rights reserved. Owned and operated by BAYA eSIM LLC.
      </div>
    </footer>
  );
}
