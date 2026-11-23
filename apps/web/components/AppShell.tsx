'use client';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || '';
  if (path.startsWith('/admin')) {
    return <div className="min-h-screen bg-[#07071a] text-white">{children}</div>;
  }
  return (
    <>
      <Header />
      <main id="main" className="pt-16">{children}</main>
      <Footer />
    </>
  );
}
