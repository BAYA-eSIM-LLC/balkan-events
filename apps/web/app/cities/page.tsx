export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gradovi' };

export default async function CitiesPage() {
  let cities: any[] = [];
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api'}/locations/cities?limit=50`, { next: { revalidate: 60 } });
    if (res.ok) cities = await res.json();
  } catch {}
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold mb-2">Gradovi</h1>
      <p className="text-gray-500 mb-8">Stvarni podaci iz lokacijskog kataloga.</p>
      {cities.length === 0 ? <p className="text-gray-400">Nema gradova ili API nije dostupan.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cities.map(c => (
            <a key={c.id} href={`/search?city=${encodeURIComponent(c.name)}`} className="border rounded-xl px-4 py-3 hover:border-violet-300">
              {c.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
