'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAccessToken, refreshAccessToken, clearTokens } from '@/lib/auth';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      let token = getAccessToken();
      if (!token) return;
      let r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (r.status === 401) {
        token = await refreshAccessToken();
        if (!token) { clearTokens(); return; }
        r = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      }
      if (r.ok) setUser(await r.json());
    }
    loadUser();
  }, []);

  function logout() {
    clearTokens();
    setUser(null);
    window.location.href = '/';
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="w-10 h-10 bg-gradient-to-br from-[#7C3AED] to-[#A020F0] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-black tracking-wide">BALKAN</span>
            <span className="text-[11px] font-bold text-[#A78BFA]">EVENTS<sup className="text-[8px]">®</sup></span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-sm text-zinc-300">
          <Link href="/search" className="hover:text-white transition">Događaji</Link>
          <Link href="/cities" className="hover:text-white transition">Gradovi</Link>
          <Link href="/categories" className="hover:text-white transition">Kategorije</Link>
          <Link href="/organizer" className="hover:text-white transition">Organizatori</Link>
          <Link href="/organizer" className="hover:text-white transition">Za organizatore</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/search" className="hidden sm:flex p-2 rounded-full hover:bg-white/10 transition" aria-label="Pretraži">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </Link>

          {user ? (
            <>
              <Link href="/profile" className="hidden sm:inline text-sm text-zinc-200 hover:text-white">{user.first_name || user.email?.split('@')[0]}</Link>
              <button onClick={logout} className="text-sm px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition">Odjava</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline text-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition">Prijava</Link>
              <Link href="/register" className="text-sm px-4 py-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A020F0] hover:opacity-90 transition font-medium shadow-lg shadow-purple-500/30">Registracija</Link>
            </>
          )}

          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg hover:bg-white/10" aria-label="Meni">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-[#10152B]/95 backdrop-blur">
          <nav className="flex flex-col px-4 py-4 gap-1 text-sm">
            <Link href="/search" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-white/10">Događaji</Link>
            <Link href="/cities" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-white/10">Gradovi</Link>
            <Link href="/categories" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-white/10">Kategorije</Link>
            <Link href="/organizer" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-white/10">Organizatori</Link>
            {!user && <Link href="/login" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg hover:bg-white/10">Prijava</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
