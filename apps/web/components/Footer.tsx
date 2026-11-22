import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <span className="w-7 h-7 bg-[#e11d48] rounded flex items-center justify-center text-xs font-black">BE</span>
            BALKAN EVENTS
          </div>
          <p className="mt-4 text-zinc-500">Platforma za događaje i ulaznice na Balkanu.</p>
          <p className="mt-3 text-xs text-zinc-600">BAYA eSIM LLC, USA</p>
        </div>
        <div>
          <p className="font-medium text-white mb-4">Platforma</p>
          <Link href="/search" className="block py-1.5 hover:text-white">Događaji</Link>
          <Link href="/cities" className="block py-1.5 hover:text-white">Gradovi</Link>
          <Link href="/organizer" className="block py-1.5 hover:text-white">Organizatori</Link>
          <Link href="/support" className="block py-1.5 hover:text-white">Kontakt</Link>
        </div>
        <div>
          <p className="font-medium text-white mb-4">Pravno</p>
          <Link href="/about" className="block py-1.5 hover:text-white">O nama</Link>
          <Link href="/terms" className="block py-1.5 hover:text-white">Uslovi korištenja</Link>
          <Link href="/privacy" className="block py-1.5 hover:text-white">Privatnost</Link>
          <Link href="/cookies" className="block py-1.5 hover:text-white">Kolačići</Link>
          <Link href="/refund" className="block py-1.5 hover:text-white">Povrat i otkazivanje</Link>
        </div>
        <div>
          <p className="font-medium text-white mb-4">Organizatori</p>
          <Link href="/organizer-terms" className="block py-1.5 hover:text-white">Uslovi za organizatore</Link>
          <Link href="/ticket-conditions" className="block py-1.5 hover:text-white">Uslovi kupovine</Link>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} BAYA eSIM LLC. Sva prava zadržana.
      </div>
    </footer>
  );
}
