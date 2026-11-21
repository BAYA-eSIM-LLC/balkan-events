import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'BALKAN EVENTS', template: '%s | BALKAN EVENTS' },
  description: 'Pronađi događaje na Balkanu i u Evropi. Koncerti, festivali, sport, kultura.',
  openGraph: { title: 'BALKAN EVENTS', description: 'Svi događaji na jednom mjestu', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <a href="#main" className="skip-link">Preskoči na sadržaj</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
