'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const nav = [
  { href: '/admin', label: 'Dashboard', icon: '▦' },
  { href: '/admin/events', label: 'Događaji', icon: '🎫' },
  { href: '/admin/categories', label: 'Kategorije', icon: '🏷️' },
  { href: '/admin/locations', label: 'Lokacije', icon: '📍' },
  { href: '/admin/users', label: 'Korisnici', icon: '👥' },
  { href: '/admin/organizations', label: 'Organizatori', icon: '🏢' },
  { href: '/admin/cms', label: 'CMS / Homepage', icon: '🖼️' },
  { href: '/admin/tickets', label: 'Ulaznice', icon: '🎟️' },
  { href: '/admin/orders', label: 'Narudžbe', icon: '🛒' },
  { href: '/admin/finance', label: 'Financije', icon: '💰' },
  { href: '/admin/support', label: 'Podrška', icon: '💬' },
  { href: '/admin/audit', label: 'Audit log', icon: '📋' },
  { href: '/admin/settings', label: 'Postavke', icon: '⚙️' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0b1f] text-white flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0f0f28] border-r border-white/10 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
          <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 100-4V8z"/><path d="M15 8v8"/></svg>
          </span>
          <span className="font-bold text-sm">SUPER ADMIN</span>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-80px)]">
          {nav.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${path === item.href ? 'bg-purple-600/20 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-white/10 flex items-center px-4 gap-3 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="font-semibold text-sm">Super Admin</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
