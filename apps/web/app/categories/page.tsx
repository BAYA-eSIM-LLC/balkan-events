export const metadata = { title: 'Kategorije' };
export default function CategoriesPage() {
  const cats = ['Muzika', 'Festival', 'Sport', 'Kultura', 'Teatar', 'Komedija', 'Konferencija', 'Porodični'];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kategorije događaja</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cats.map(c => (
          <a key={c} href={`/search?q=${encodeURIComponent(c)}`} className="block bg-white border rounded-lg p-4 text-center hover:shadow">{c}</a>
        ))}
      </div>
    </div>
  );
}
