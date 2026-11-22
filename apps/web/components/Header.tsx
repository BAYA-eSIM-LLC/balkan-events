'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="w-8 h-8 bg-[#e11d48] rounded-md flex items-center justify-center text-xs font-black shrink-0">BE</span>
          <span className="flex flex-col leading-[1.1] text-xs sm:text-sm font-bold uppercase tracking-wide">
            <span>Balkan</span>
            <span>Events</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm text-zinc-300">
          <Link href="/" className="hover:text-white transition">Početna</Link>
          <Link href="/search" className="hover:text-white transition">Događaji</Link>
          <Link href="/search?category=koncerti" className="hover:text-white transition">Koncerti</Link>
          <Link href="/search?category=festivali" className="hover:text-white transition">Festivali</Link>
          <Link href="/search?category=pozoriste" className="hover:text-white transition">Pozorište</Link>
          <Link href="/cities" className="hover:text-white transition">Gradovi</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/search" className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-300 hover:text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Pretraga
          </Link>
          <Link href="/login" className="hidden sm:inline text-sm text-zinc-300 hover:text-white">Prijava</Link>
          <Link href="/register" className="bg-[#e11d48] hover:bg-[#be123c] text-white px-4 py-1.5 rounded-md text-sm font-medium transition">Registracija</Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 -mr-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-4 space-y-3">
          <Link href="/" onClick={() => setOpen(false)} className="block py-2">Početna</Link>
          <Link href="/search" onClick={() => setOpen(false)} className="block py-2">Događaji</Link>
          <Link href="/search?category=koncerti" onClick={() => setOpen(false)} className="block py-2">Koncerti</Link>
          <Link href="/search?category=festivali" onClick={() => setOpen(false)} className="block py-2">Festivali</Link>
          <Link href="/search?category=pozoriste" onClick={() => setOpen(false)} className="block py-2">Pozorište</Link>
          <Link href="/cities" onClick={() => setOpen(false)} className="block py-2">Gradovi</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="block py-2">Prijava</Link>
          <Link href="/organizer" onClick={() => setOpen(false)} className="block py-2">Organizatori</Link>
        </div>
      )}
    </header>
  );
}
