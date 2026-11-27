'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="BALKAN EVENTS - početna">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-sky-300 shadow-md shadow-slate-900/15">B</span>
          <span className="text-base font-black tracking-tight text-slate-950 sm:text-lg">BALKAN<span className="text-brand-600">EVENTS</span></span>
        </Link>

        <form action="/search" role="search" className="ml-auto hidden max-w-md flex-1 md:flex">
          <label htmlFor="site-search" className="sr-only">Pretraži događaje</label>
          <input id="site-search" name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraži koncerte, gradove, izvođače..." className="min-w-0 flex-1 rounded-l-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/15" />
          <button type="submit" className="rounded-r-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-brand-700">Traži</button>
        </form>

        <nav aria-label="Glavna navigacija" className="ml-auto hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
          <Link className="transition hover:text-brand-700" href="/search">Događaji</Link>
          <Link className="transition hover:text-brand-700" href="/categories">Kategorije</Link>
          <Link className="rounded-xl bg-slate-950 px-4 py-2.5 text-white transition hover:bg-brand-700" href="/login">Prijava</Link>
        </nav>

        <button type="button" className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 md:hidden" aria-label={menuOpen ? 'Zatvori meni' : 'Otvori meni'} aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
          <span className="text-xl" aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 md:hidden">
          <form action="/search" role="search" className="mb-3 flex">
            <label htmlFor="mobile-site-search" className="sr-only">Pretraži događaje</label>
            <input id="mobile-site-search" name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraži događaje..." className="min-w-0 flex-1 rounded-l-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-brand-500" />
            <button type="submit" className="rounded-r-xl bg-slate-950 px-4 text-sm font-bold text-white">Traži</button>
          </form>
          <nav aria-label="Mobilna navigacija" className="grid gap-1 text-sm font-semibold">
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-slate-700 hover:bg-slate-50" href="/search">Događaji</Link>
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-slate-700 hover:bg-slate-50" href="/categories">Kategorije</Link>
            <Link onClick={() => setMenuOpen(false)} className="rounded-lg bg-slate-950 px-3 py-3 text-white" href="/login">Prijava / Moj račun</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
