'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => d && setUser(d))
        .catch(() => {});
    }
  }, []);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0b1f]/95 backdrop-blur text-white border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V8z" />
              <path strokeLinecap="round" d="M15 8v8" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[11px] font-bold tracking-wide">BALKAN</span>
            <span className="text-[10px] font-semibold text-zinc-300">EVENTS</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm text-zinc-300">
          <Link href="/search" className="hover:text-white">Događaji</Link>
          <Link href="/categories" className="hover:text-white">Kategorije</Link>
          <Link href="/cities" className="hover:text-white">Gradovi</Link>
          <Link href="/organizer" className="hover:text-white">Organizatori</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" className="p-2 text-zinc-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </Link>
          {user ? (
            <>
              <Link href="/profile" className="hidden sm:inline text-sm text-white px-2">{user.full_name || user.email?.split('@')[0]}</Link>
              <Link href="/my-tickets" className="hidden sm:inline text-sm text-zinc-300 hover:text-white px-2">Ulaznice</Link>
              <button onClick={logout} className="text-sm text-zinc-400 hover:text-white px-2">Odjava</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-sm text-zinc-300 hover:text-white px-2">Prijava</Link>
              <Link href="/register" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">Registracija</Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 -mr-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-[#0f0f28] border-t border-white/10 px-4 py-3 space-y-1">
          <Link href="/search" onClick={() => setOpen(false)} className="block py-2.5">Događaji</Link>
          <Link href="/categories" onClick={() => setOpen(false)} className="block py-2.5">Kategorije</Link>
          <Link href="/cities" onClick={() => setOpen(false)} className="block py-2.5">Gradovi</Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setOpen(false)} className="block py-2.5">{user.full_name || 'Profil'}</Link>
              <Link href="/my-tickets" onClick={() => setOpen(false)} className="block py-2.5">Moje ulaznice</Link>
              <button onClick={logout} className="block py-2.5 text-left w-full">Odjava</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="block py-2.5">Prijava</Link>
              <Link href="/register" onClick={() => setOpen(false)} className="block py-2.5">Registracija</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
