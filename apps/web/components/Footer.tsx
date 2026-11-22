import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0d0b1f] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6d3df5] to-[#d4af77] grid place-items-center text-white text-xs font-bold">B</span>
            <span className="font-display font-bold">BALKAN EVENTS</span>
          </div>
          <p className="text-white/50 mt-3 text-xs">Najveći događaji na Balkanu.</p>
        </div>
        <div>
          <p className="font-medium mb-3 text-white/80">Platforma</p>
          <Link href="/search" className="block text-white/50 hover:text-white py-1">Događaji</Link>
          <Link href="/categories" className="block text-white/50 hover:text-white py-1">Kategorije</Link>
          <Link href="/cities" className="block text-white/50 hover:text-white py-1">Gradovi</Link>
        </div>
        <div>
          <p className="font-medium mb-3 text-white/80">Organizatori</p>
          <Link href="/organizer" className="block text-white/50 hover:text-white py-1">Postani organizator</Link>
          <Link href="/support" className="block text-white/50 hover:text-white py-1">Kontakt</Link>
        </div>
        <div>
          <p className="font-medium mb-3 text-white/80">Pravno</p>
          <Link href="/privacy" className="block text-white/50 hover:text-white py-1">Privatnost</Link>
          <Link href="/terms" className="block text-white/50 hover:text-white py-1">Uslovi</Link>
          <Link href="/refund" className="block text-white/50 hover:text-white py-1">Povrat</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} BALKAN EVENTS · BAYA eSIM LLC
      </div>
    </footer>
  );
}
