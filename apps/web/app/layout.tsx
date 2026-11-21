import './globals.css';
import Header from '@/components/Header';
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
        <main id="main" className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t mt-12 py-6 text-center text-sm text-ink-muted">
          <div className="flex justify-center gap-4 mb-2">
            <a href="/privacy">Privatnost</a>
            <a href="/terms">Uslovi</a>
            <a href="/refund">Povrat</a>
            <a href="/support">Podrška</a>
          </div>
          © {new Date().getFullYear()} BALKAN EVENTS
        </footer>
      </body>
    </html>
  );
}
