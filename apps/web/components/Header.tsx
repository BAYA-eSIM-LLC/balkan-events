'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-[#0b1220] text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tight shrink-0">BALKAN EVENTS</Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm text-white/80">
          <Link href="/search" className="hover:text-white">Događaji</Link>
          <Link href="/categories" className="hover:text-white">Kategorije</Link>
          <Link href="/search" className="hover:text-white">Gradovi</Link>
          <Link href="/support" className="hover:text-white">Organizatori</Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/search" aria-label="Pretraga" className="p-2 hover:bg-white/10 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </Link>
          <span className="hidden md:inline text-sm text-white/70">BS</span>
          <Link href="/login" className="hidden md:inline text-sm">Prijava</Link>
          <Link href="/register" className="btn-gradient text-white text-sm font-medium px-4 py-2 rounded-lg">Registracija</Link>
          <button type="button" className="lg:hidden p-2" aria-label="Meni" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-[#111827] px-4 py-4 space-y-2 border-t border-white/10">
          <Link href="/search" className="block py-2" onClick={() => setOpen(false)}>Događaji</Link>
          <Link href="/categories" className="block py-2" onClick={() => setOpen(false)}>Kategorije</Link>
          <Link href="/search" className="block py-2" onClick={() => setOpen(false)}>Gradovi</Link>
          <Link href="/support" className="block py-2" onClick={() => setOpen(false)}>Organizatori</Link>
          <Link href="/login" className="block py-2" onClick={() => setOpen(false)}>Prijava</Link>
        </div>
      )}
    </header>
  );
}
