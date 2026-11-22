'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-[#070b14] text-white sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-5 h-[68px] flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#d4af77] flex items-center justify-center text-sm font-bold">B</div>
          <span className="text-lg font-semibold tracking-tight">BALKAN EVENTS</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm text-white/70">
          <Link href="/search" className="hover:text-white transition">Događaji</Link>
          <Link href="/categories" className="hover:text-white transition">Kategorije</Link>
          <Link href="/cities" className="hover:text-white transition">Gradovi</Link>
          <Link href="/organizer" className="hover:text-white transition">Organizatori</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/search" className="p-2 hover:bg-white/10 rounded-lg" aria-label="Pretraga">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </Link>
          <Link href="/login" className="hidden md:inline text-sm text-white/80 hover:text-white">Prijava</Link>
          <Link href="/register" className="btn-violet text-white text-sm font-medium px-5 py-2.5 rounded-xl">Registracija</Link>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Meni">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden bg-[#0f172a] border-t border-white/10 px-5 py-4 space-y-3">
          <Link href="/search" className="block py-2" onClick={() => setOpen(false)}>Događaji</Link>
          <Link href="/categories" className="block py-2" onClick={() => setOpen(false)}>Kategorije</Link>
          <Link href="/cities" className="block py-2" onClick={() => setOpen(false)}>Gradovi</Link>
          <Link href="/organizer" className="block py-2" onClick={() => setOpen(false)}>Organizatori</Link>
          <Link href="/login" className="block py-2" onClick={() => setOpen(false)}>Prijava</Link>
        </div>
      )}
    </header>
  );
}
