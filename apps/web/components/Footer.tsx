import Link from 'next/link';

function MiniAppStore() {
  return (
    <a href="#" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-md text-xs transition">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      App Store
    </a>
  );
}

function MiniGooglePlay() {
  return (
    <a href="#" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white px-3 py-1.5 rounded-md text-xs transition">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
      Google Play
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#0b0b1f] text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V8z" />
                <path strokeLinecap="round" d="M15 8v8" />
              </svg>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[11px] font-bold">BALKAN</span>
              <span className="text-[10px] font-semibold text-zinc-300">EVENTS</span>
            </span>
          </Link>
          <p className="mt-3 text-xs leading-relaxed">Discover. Experience. Connect. Regionalna platforma za događaje i prodaju ulaznica.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <MiniAppStore />
            <MiniGooglePlay />
          </div>
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
