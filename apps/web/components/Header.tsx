'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100/80 bg-[#fffaf5]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2" aria-label="BALKAN EVENTS - početna">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-lg font-black text-white shadow-md shadow-orange-900/15">▶</span>
          <span className="text-[15px] font-black leading-tight tracking-tight text-slate-950 sm:text-lg">BALKAN<br className="sm:hidden" /><span className="sm:ml-1">EVENTS</span></span>
        </Link>

        <form action="/search" role="search" className="ml-auto hidden max-w-md flex-1 md:flex">
          <label htmlFor="site-search" className="sr-only">Pretraži događaje</label>
          <input id="site-search" name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraži koncerte, gradove, izvođače..." className="min-w-0 flex-1 rounded-l-full border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10" />
          <button type="submit" className="rounded-r-full bg-orange-600 px-5 text-sm font-bold text-white transition hover:bg-orange-700">Traži</button>
        </form>

        <nav aria-label="Glavna navigacija" className="ml-auto hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
          <Link className="hover:text-orange-700" href="/search">Događaji</Link>
          <Link className="hover:text-orange-700" href="/categories">Kategorije</Link>
          <Link className="rounded-full bg-orange-600 px-5 py-2.5 text-white transition hover:bg-orange-700" href="/login">Prijava</Link>
        </nav>

        <button type="button" className="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-orange-100 bg-white text-slate-800 md:hidden" aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
          <span className="text-xl" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-orange-100 bg-[#fffaf5] px-4 pb-5 pt-3 md:hidden">
          <form action="/search" role="search" className="mb-3 flex">
            <label htmlFor="mobile-site-search" className="sr-only">Pretraži događaje</label>
            <input id="mobile-site-search" name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraži događaje..." className="min-w-0 flex-1 rounded-l-full border border-orange-100 bg-white px-3 py-3 text-sm outline-none focus:border-orange-400" />
            <button type="submit" className="rounded-r-full bg-orange-600 px-4 text-sm font-bold text-white">Traži</button>
          </form>
          <nav aria-label="Mobilna navigacija" className="grid gap-1 text-sm font-semibold">
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-slate-700 hover:bg-orange-50" href="/search">Događaji</Link>
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-slate-700 hover:bg-orange-50" href="/categories">Kategorije</Link>
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg bg-orange-600 px-3 py-3 text-white" href="/login">Prijava / Moj račun</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
