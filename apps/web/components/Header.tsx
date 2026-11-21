'use client';
import Link from 'next/link';
import { useState } from 'react';

const categories = [
  { href: '/search?q=koncert', label: 'Koncerti' },
  { href: '/search?q=festival', label: 'Festivali' },
  { href: '/search?q=sport', label: 'Sport' },
  { href: '/search?q=teatar', label: 'Teatar' },
  { href: '/categories', label: 'Sve kategorije' },
];

export default function Header() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-brand-700 shrink-0">BALKAN EVENTS</Link>

        <form action="/search" className="hidden md:flex flex-1 max-w-md">
          <input
            name="q"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Pretraži događaje..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <button type="submit" className="bg-brand-600 text-white px-4 rounded-r-lg text-sm font-medium">Traži</button>
        </form>

        <nav className="hidden md:flex items-center gap-5 text-sm ml-auto">
          <Link href="/search" className="text-ink hover:text-brand-700">Događaji</Link>
          <Link href="/categories" className="text-ink hover:text-brand-700">Kategorije</Link>
          <Link href="/login" className="text-brand-600 font-medium">Prijava</Link>
        </nav>

        <button
          type="button"
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100"
          aria-label="Meni"
          onClick={() => setOpen(!open)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <form action="/search" className="flex">
            <input name="q" placeholder="Pretraži..." className="flex-1 border rounded-l-lg px-3 py-2 text-sm" />
            <button type="submit" className="bg-brand-600 text-white px-4 rounded-r-lg text-sm">Traži</button>
          </form>
          <Link href="/search" className="block py-2 text-ink" onClick={() => setOpen(false)}>Događaji</Link>
          <Link href="/categories" className="block py-2 text-ink" onClick={() => setOpen(false)}>Kategorije</Link>
          <Link href="/login" className="block py-2 text-brand-600 font-medium" onClick={() => setOpen(false)}>Prijava</Link>
        </div>
      )}
    </header>
  );
}
