import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#eee] text-[#666] text-sm mt-8">
      <div className="max-w-7xl mx-auto px-5 py-8 grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 text-[#1a1a1a]">
            <span className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#F7931E] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="font-bold text-sm">BALKAN EVENTS</span>
          </Link>
          <p className="mt-2 text-xs">Regionalna platforma za događaje i ulaznice.</p>
        </div>
        <div>
          <p className="font-semibold text-xs text-[#1a1a1a] mb-2">PLATFORM</p>
          <div className="space-y-1.5 text-xs">
            <Link href="/about" className="block hover:text-[#FF6B35]">O nama</Link>
            <Link href="/search" className="block hover:text-[#FF6B35]">Događaji</Link>
            <Link href="/categories" className="block hover:text-[#FF6B35]">Kategorije</Link>
            <Link href="/cities" className="block hover:text-[#FF6B35]">Gradovi</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-xs text-[#1a1a1a] mb-2">PODRŠKA</p>
          <div className="space-y-1.5 text-xs">
            <Link href="/contact" className="block hover:text-[#FF6B35]">Kontakt</Link>
            <Link href="/faq" className="block hover:text-[#FF6B35]">FAQ</Link>
            <a href="mailto:hello@balkanevents.org" className="block hover:text-[#FF6B35]">hello@balkanevents.org</a>
          </div>
        </div>
        <div>
          <p className="font-semibold text-xs text-[#1a1a1a] mb-2">PRAVNO</p>
          <div className="space-y-1.5 text-xs">
            <Link href="/terms" className="block hover:text-[#FF6B35]">Uslovi</Link>
            <Link href="/privacy" className="block hover:text-[#FF6B35]">Privatnost</Link>
            <Link href="/refund" className="block hover:text-[#FF6B35]">Povrat</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[#eee] py-3 text-center text-xs text-[#999]">
        © {new Date().getFullYear()} BALKAN EVENTS · BAYA eSIM LLC
      </div>
    </footer>
  );
}
