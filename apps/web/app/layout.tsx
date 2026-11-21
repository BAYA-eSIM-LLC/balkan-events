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
      <body>
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        <footer className="border-t mt-12 py-6 text-center text-sm text-gray-500">
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
