export const metadata = { title: 'Balkan Events', description: 'Svi dogadjaji na jednom mjestu' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="bs"><body>{children}</body></html>
}
