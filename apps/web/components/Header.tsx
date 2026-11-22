'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute top-0 left-0 right-0 z-10">
      <div className="max-w-5xl mx-auto px-6 h-[76px] flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 text-white font-display font-extrabold text-lg">
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8b62ff] to-[#4b2bd6] grid place-items-center text-sm">B</span>
          BALKAN EVENTS
        </Link>
        <nav className="hidden lg:flex gap-7 text-[#dcd8f7] text-sm font-medium">
          <Link href="/search" className="hover:text-white">Događaji</Link>
          <Link href="/categories" className="hover:text-white">Kategorije</Link>
          <Link href="/cities" className="hover:text-white">Gradovi</Link>
          <Link href="/organizer" className="hover:text-white">Organizatori</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/search" className="p-2 text-[#dcd8f7] hover:bg-white/10 rounded-lg" aria-label="Pretraga">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </Link>
          <Link href="/login" className="hidden md:inline text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10">Prijava</Link>
          <Link href="/register" className="btn-primary text-sm font-semibold px-5 py-2.5 rounded-xl">Registracija</Link>
          <button className="lg:hidden p-2 text-white" onClick={() => setOpen(!open)} aria-label="Meni">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-[#171433] px-6 py-4 space-y-2 border-t border-white/10">
          <Link href="/search" className="block py-2 text-white" onClick={() => setOpen(false)}>Događaji</Link>
          <Link href="/categories" className="block py-2 text-white" onClick={() => setOpen(false)}>Kategorije</Link>
          <Link href="/login" className="block py-2 text-white" onClick={() => setOpen(false)}>Prijava</Link>
        </div>
      )}
    </header>
  );
}
