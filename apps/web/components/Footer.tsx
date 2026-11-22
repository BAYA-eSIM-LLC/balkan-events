import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0b1220] text-white mt-0">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold text-base">BALKAN EVENTS</p>
          <p className="text-white/60 mt-2">Najveći događaji na Balkanu.</p>
        </div>
        <div>
          <p className="font-semibold mb-3">Platforma</p>
          <Link href="/search" className="block text-white/60 hover:text-white py-1">Događaji</Link>
          <Link href="/categories" className="block text-white/60 hover:text-white py-1">Kategorije</Link>
          <Link href="/search" className="block text-white/60 hover:text-white py-1">Gradovi</Link>
        </div>
        <div>
          <p className="font-semibold mb-3">Organizatori</p>
          <Link href="/support" className="block text-white/60 hover:text-white py-1">Postani organizator</Link>
          <Link href="/support" className="block text-white/60 hover:text-white py-1">Kontakt</Link>
        </div>
        <div>
          <p className="font-semibold mb-3">Podrška</p>
          <Link href="/support" className="block text-white/60 hover:text-white py-1">Centar za pomoć</Link>
          <Link href="/support" className="block text-white/60 hover:text-white py-1">Kontaktiraj nas</Link>
        </div>
        <div>
          <p className="font-semibold mb-3">Pravne informacije</p>
          <Link href="/privacy" className="block text-white/60 hover:text-white py-1">Privatnost</Link>
          <Link href="/terms" className="block text-white/60 hover:text-white py-1">Uslovi</Link>
          <Link href="/refund" className="block text-white/60 hover:text-white py-1">Povrat</Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-sm text-white/50 flex justify-center gap-6">
        <span>© {new Date().getFullYear()} BALKAN EVENTS</span>
        <span>BS · EN</span>
      </div>
    </footer>
  );
}
