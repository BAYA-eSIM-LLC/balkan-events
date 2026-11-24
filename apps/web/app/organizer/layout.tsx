'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { OrganizerProvider, useOrganizer } from '@/lib/organizer-context';

const nav = [
  { href: '/organizer', label: 'Dashboard', icon: '▦' },
  { href: '/organizer/events', label: 'Događaji', icon: '🎫' },
  { href: '/organizer/tickets', label: 'Ulaznice', icon: '🎟️' },
  { href: '/organizer/orders', label: 'Narudžbe', icon: '🛒' },
  { href: '/organizer/attendees', label: 'Sudionici', icon: '👥' },
  { href: '/organizer/scanner', label: 'QR Scanner', icon: '📷' },
  { href: '/organizer/reports', label: 'Izvještaji', icon: '📊' },
  { href: '/organizer/team', label: 'Tim', icon: '🤝' },
  { href: '/organizer/profile', label: 'Profil', icon: '🏢' },
];

function LayoutInner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const { orgs, activeOrg, setActiveOrgId } = useOrganizer();
  return (
    <div className="min-h-screen bg-[#0b0b1f] text-white flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-[#0f0f28] border-r border-white/10 transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} lg:static`}>
        <div className="p-4 border-b border-white/10">
          <p className="font-bold text-sm">ORGANIZER</p>
          <p className="text-xs text-zinc-500">BALKAN EVENTS</p>
        </div>
        <nav className="p-2 space-y-0.5">
          {nav.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${path === item.href ? 'bg-purple-600/20 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2 border-b border-white/10 bg-white/5 flex items-center gap-2 text-sm">
          <span className="text-zinc-400">Organizacija:</span>
          {orgs.length > 1 ? (
            <select value={activeOrg?.id || ''} onChange={e => setActiveOrgId(Number(e.target.value))} className="bg-transparent border border-white/20 rounded px-2 py-1">
              {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          ) : (
            <span>{activeOrg?.name || '—'}</span>
          )}
          {activeOrg && activeOrg.verification_status !== 'VERIFIED' && <span className="text-amber-400 text-xs">Nije verificirana</span>}
        </div>
        <header className="h-14 border-b border-white/10 flex items-center px-4 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <span className="ml-2 font-semibold text-sm">Organizer</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}


export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <OrganizerProvider><LayoutInner>{children}</LayoutInner></OrganizerProvider>;
}
