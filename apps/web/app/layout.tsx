import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'BALKAN EVENTS', template: '%s | BALKAN EVENTS' },
  description: 'Pronađi događaje na Balkanu. Koncerti, festivali, pozorište, sport. Kupi ulaznice jednostavno i sigurno.',
  openGraph: { title: 'BALKAN EVENTS', description: 'Doživi najbolje događaje na Balkanu', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-zinc-900 antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded">Preskoči na sadržaj</a>
        <Header />
        <main id="main" className="pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
