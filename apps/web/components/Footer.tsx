import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-12 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="w-7 h-7 bg-[#e11d48] rounded flex items-center justify-center text-xs font-black">BE</span>
            BALKAN EVENTS
          </div>
          <p className="mt-4 text-zinc-500 text-xs leading-relaxed">Platforma za događaje i ulaznice na Balkanu.</p>
          <p className="mt-3 text-xs text-zinc-600">BAYA eSIM LLC, USA</p>
        </div>
        <div>
          <p className="font-medium text-white mb-3 text-sm">Platforma</p>
          <Link href="/search" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Događaji</Link>
          <Link href="/cities" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Gradovi</Link>
          <Link href="/organizer" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Organizatori</Link>
          <Link href="/support" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Kontakt</Link>
        </div>
        <div>
          <p className="font-medium text-white mb-3 text-sm">Pravno</p>
          <Link href="/about" className="block py-1.5 text-zinc-500 hover:text-white text-sm">O nama</Link>
          <Link href="/terms" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Uslovi korištenja</Link>
          <Link href="/privacy" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Privatnost</Link>
          <Link href="/cookies" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Kolačići</Link>
          <Link href="/refund" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Povrat i otkazivanje</Link>
        </div>
        <div>
          <p className="font-medium text-white mb-3 text-sm">Organizatori</p>
          <Link href="/organizer-terms" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Uslovi za organizatore</Link>
          <Link href="/ticket-conditions" className="block py-1.5 text-zinc-500 hover:text-white text-sm">Uslovi kupovine</Link>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-5 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} BAYA eSIM LLC. Sva prava zadržana.
      </div>
    </footer>
  );
}
