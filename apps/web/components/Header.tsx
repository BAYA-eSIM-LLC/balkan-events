'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="w-8 h-8 bg-[#ff4d4d] rounded-lg flex items-center justify-center text-sm">BE</span>
          <span className="hidden sm:inline">BALKAN EVENTS</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/search" className="hover:text-white">Događaji</Link>
          <Link href="/search" className="hover:text-white">Kategorije</Link>
          <Link href="/organizer" className="hover:text-white">Organizatori</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/search" className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </Link>
          <Link href="/register" className="bg-[#ff4d4d] hover:bg-[#ff6b6b] text-white px-4 py-1.5 rounded-full text-sm font-medium transition">Registracija</Link>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 space-y-3 text-white">
          <Link href="/search" onClick={() => setOpen(false)} className="block">Događaji</Link>
          <Link href="/organizer" onClick={() => setOpen(false)} className="block">Organizatori</Link>
          <Link href="/login" onClick={() => setOpen(false)} className="block">Prijava</Link>
        </div>
      )}
    </header>
  );
}
