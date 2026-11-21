import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <p className="font-semibold mb-3">BALKAN EVENTS</p>
          <p className="text-gray-400">Platforma za otkrivanje događaja na Balkanu i u Evropi.</p>
        </div>
        <div>
          <p className="font-semibold mb-3">Organizatori</p>
          <Link href="/support" className="block text-gray-400 hover:text-white py-1">Kontakt</Link>
          <Link href="/support" className="block text-gray-400 hover:text-white py-1">Postani organizator</Link>
        </div>
        <div>
          <p className="font-semibold mb-3">Podrška</p>
          <Link href="/support" className="block text-gray-400 hover:text-white py-1">Centar za pomoć</Link>
          <Link href="/support" className="block text-gray-400 hover:text-white py-1">Kontaktiraj nas</Link>
        </div>
        <div>
          <p className="font-semibold mb-3">Pravne informacije</p>
          <Link href="/privacy" className="block text-gray-400 hover:text-white py-1">Privatnost</Link>
          <Link href="/terms" className="block text-gray-400 hover:text-white py-1">Uslovi korištenja</Link>
          <Link href="/refund" className="block text-gray-400 hover:text-white py-1">Politika povrata</Link>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} BALKAN EVENTS
      </div>
    </footer>
  );
}
