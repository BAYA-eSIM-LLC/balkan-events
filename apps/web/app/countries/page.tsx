export const dynamic = 'force-dynamic';
export const metadata = { title: 'Države' };

export default async function CountriesPage() {
  let countries: any[] = [];
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api'}/locations/countries`, { next: { revalidate: 60 } });
    if (res.ok) countries = await res.json();
  } catch {}
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold mb-2">Države</h1>
      <p className="text-gray-500 mb-8">ISO podaci iz kataloga.</p>
      {countries.length === 0 ? <p className="text-gray-400">Nema podataka ili API nije dostupan.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {countries.map(c => (
            <div key={c.id} className="border rounded-xl px-4 py-3">
              <div className="font-medium">{c.name_en}</div>
              <div className="text-sm text-gray-500">{c.iso_alpha2} · {c.currency_code || '–'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
