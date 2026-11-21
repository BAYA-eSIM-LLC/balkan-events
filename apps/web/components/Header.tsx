'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [q, setQ] = useState('');
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-brand-700">BALKAN EVENTS</Link>
        <form action="/search" className="flex-1 flex">
          <input name="q" value={q} onChange={e => setQ(e.target.value)} placeholder="Pretraži događaje..." className="flex-1 border border-gray-300 rounded-l px-3 py-2 text-sm" />
          <button type="submit" className="bg-brand-600 text-white px-4 rounded-r text-sm">Traži</button>
        </form>
        <nav className="flex gap-3 text-sm">
          <Link href="/search">Događaji</Link>
          <Link href="/categories">Kategorije</Link>
          <Link href="/login">Prijava</Link>
        </nav>
      </div>
    </header>
  );
}
