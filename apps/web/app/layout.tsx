import './globals.css';
import AppShell from '@/components/AppShell';
import type { Metadata, Viewport } from 'next';
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF7F2',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://balkanevents.org'),
  title: { default: 'BALKAN EVENTS – Ulaznice za koncerte i događaje', template: '%s | BALKAN EVENTS' },
  description: 'Pronađi i kupi ulaznice za najbolje događaje na Balkanu. Koncerti, festivali, sport, teatar. Sigurna kupovina, QR ulaznice.',
  keywords: ['ulaznice', 'koncerti', 'festivali', 'Balkan', 'događaji', 'sport', 'teatar', 'BiH', 'Hrvatska', 'Srbija'],
  authors: [{ name: 'BALKAN EVENTS' }],
  creator: 'BAYA eSIM LLC',
  publisher: 'BALKAN EVENTS',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website',
    locale: 'bs_BA',
    url: 'https://balkanevents.org',
    siteName: 'BALKAN EVENTS',
    title: 'BALKAN EVENTS – Ulaznice za koncerte i događaje',
    description: 'Pronađi i kupi ulaznice za najbolje događaje na Balkanu.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'BALKAN EVENTS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BALKAN EVENTS',
    description: 'Ulaznice za najbolje događaje na Balkanu',
  },
  alternates: { canonical: 'https://balkanevents.org' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" className="font-sans">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'BALKAN EVENTS',
          url: 'https://balkanevents.org',
          logo: 'https://balkanevents.org/logo.png',
          sameAs: [],
        })}} />
      </head>
      <body className="bg-[#FAF7F2] text-[#1a1a1a] antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:text-black focus:px-3 focus:py-2 focus:rounded">Preskoči na sadržaj</a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
