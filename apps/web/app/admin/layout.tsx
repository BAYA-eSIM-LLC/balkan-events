'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';

const groups = [
  {
    title: 'Pregled',
    items: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/analytics', label: 'Analitika' },
    ],
  },
  {
    title: 'Katalog',
    items: [
      { href: '/admin/events', label: 'Događaji' },
      { href: '/admin/categories', label: 'Kategorije' },
      { href: '/admin/locations', label: 'Lokacije' },
      { href: '/admin/seat-maps', label: 'Mape sjedišta' },
    ],
  },
  {
    title: 'Ljudi',
    items: [
      { href: '/admin/users', label: 'Korisnici' },
      { href: '/admin/organizations', label: 'Organizatori' },
    ],
  },
  {
    title: 'Prodaja',
    items: [
      { href: '/admin/tickets', label: 'Ulaznice' },
      { href: '/admin/orders', label: 'Narudžbe' },
      { href: '/admin/finance', label: 'Financije' },
      { href: '/admin/pos', label: 'POS' },
    ],
  },
  {
    title: 'Sadržaj',
    items: [
      { href: '/admin/cms', label: 'CMS' },
      { href: '/admin/sponsors', label: 'Sponzori' },
    ],
  },
  {
    title: 'Sustav',
    items: [
      { href: '/admin/support', label: 'Podrška' },
      { href: '/admin/audit', label: 'Audit log' },
      { href: '/admin/settings', label: 'Postavke' },
    ],
  },
];

function Icon({ name }: { name: string }) {
  const common = 'w-4 h-4';
  if (name === 'Dashboard') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
  if (name === 'Analitika') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16l3-4 3 2 4-6"/></svg>;
  if (name === 'Događaji') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16v12H4z"/><path d="M8 7V5h8v2"/></svg>;
  if (name === 'Kategorije') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h10"/></svg>;
  if (name === 'Lokacije') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>;
  if (name === 'Mape sjedišta') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/></svg>;
  if (name === 'Korisnici') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0112 0"/><circle cx="17" cy="9" r="2"/><path d="M17 14a5 5 0 014 5"/></svg>;
  if (name === 'Organizatori') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 20V8l8-4 8 4v12"/><path d="M9 20v-6h6v6"/></svg>;
  if (name === 'Ulaznice') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a2 2 0 100-4V8z"/><path d="M12 6v12"/></svg>;
  if (name === 'Narudžbe') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6h15l-1.5 9h-12z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>;
  if (name === 'Financije') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>;
  if (name === 'POS') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
  if (name === 'CMS') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/></svg>;
  if (name === 'Sponzori') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.8 7.1 18.2 8 12.7 4 8.8 9.5 8z"/></svg>;
  if (name === 'Podrška') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 16a7 7 0 1114 0v2a2 2 0 01-2 2h-2"/><path d="M8 18h.01M12 18h.01"/></svg>;
  if (name === 'Audit log') return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 6h11M8 12h11M8 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/></svg>;
  return <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ email?: string; role?: string } | null>(null);
  const isTest = process.env.NEXT_PUBLIC_ADMIN_ENV === 'TEST';

  useEffect(() => {
    adminFetch('/admin/me').then(setMe).catch(() => setMe(null));
  }, []);

  function active(href: string) {
    return href === '/admin' ? path === '/admin' : path.startsWith(href);
  }

  function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-[#07071a] text-white flex">
      {open && <button className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} aria-label="Zatvori meni" />}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] bg-[#0c0c24] border-r border-white/10 transform transition-transform lg:translate-x-0 lg:static ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 px-4 flex items-center gap-3 border-b border-white/10">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6d3df5] to-[#d4af77] grid place-items-center text-white text-xs font-bold">BE</span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold tracking-[0.16em]">BALKAN EVENTS</p>
            <p className="text-[10px] text-[#d4af77] font-semibold">SUPER ADMIN</p>
          </div>
        </div>
        <nav className="p-3 overflow-y-auto h-[calc(100vh-64px)] space-y-4">
          {groups.map(group => (
            <div key={group.title}>
              <p className="px-3 mb-1 text-[10px] uppercase tracking-[0.16em] text-zinc-500">{group.title}</p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${active(item.href) ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon name={item.label} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 bg-[#07071a]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-2 text-zinc-300" aria-label="Otvori meni">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold">BALKAN EVENTS</p>
              <p className="text-[11px] text-zinc-500">Administracija platforme</p>
            </div>
            {isTest && <span className="text-[10px] font-bold tracking-wide bg-amber-400 text-black px-2 py-1 rounded-md">TEST</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium truncate max-w-[220px]">{me?.email || 'Administrator'}</p>
              <p className="text-[11px] text-zinc-500 uppercase">{me?.role || 'SUPER ADMIN'}</p>
            </div>
            <button onClick={logout} className="text-xs px-3 py-2 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">Odjava</button>
          </div>
        </header>
        <main id="main" className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
