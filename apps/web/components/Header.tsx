'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b1f]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-white shrink-0">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6d3df5] via-[#8b62ff] to-[#d4af77] grid place-items-center"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></span>
          <span className="font-display font-extrabold text-sm md:text-base tracking-tight">BALKAN EVENTS</span>
        </Link>
        <nav className="hidden lg:flex gap-6 text-[#dcd8f7] text-sm font-medium ml-4">
          <Link href="/search" className="hover:text-white transition">Događaji</Link>
          <Link href="/categories" className="hover:text-white transition">Kategorije</Link>
          <Link href="/cities" className="hover:text-white transition">Gradovi</Link>
          <Link href="/organizer" className="hover:text-white transition">Organizatori</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search" className="p-2 text-[#dcd8f7] hover:bg-white/10 rounded-lg" aria-label="Pretraga">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </Link>
          <Link href="/login" className="hidden md:inline text-white text-sm font-medium px-3 py-1.5 rounded-lg border border-white/25 hover:bg-white/10">Prijava</Link>
          <Link href="/register" className="bg-[#6d3df5] hover:bg-[#7c50ff] text-white text-sm font-semibold px-4 py-2 rounded-xl transition">Registracija</Link>
          <button className="lg:hidden p-2 text-white" onClick={() => setOpen(!open)} aria-label="Meni">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-[#171433] px-4 py-3 space-y-1 border-t border-white/10">
          <Link href="/search" className="block py-2.5 text-white" onClick={() => setOpen(false)}>Događaji</Link>
          <Link href="/categories" className="block py-2.5 text-white" onClick={() => setOpen(false)}>Kategorije</Link>
          <Link href="/cities" className="block py-2.5 text-white" onClick={() => setOpen(false)}>Gradovi</Link>
          <Link href="/organizer" className="block py-2.5 text-white" onClick={() => setOpen(false)}>Organizatori</Link>
          <Link href="/login" className="block py-2.5 text-white" onClick={() => setOpen(false)}>Prijava</Link>
        </div>
      )}
    </header>
  );
}
