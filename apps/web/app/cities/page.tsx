export const dynamic = 'force-dynamic';
import { EmptyState } from '@/components/ui';

export const metadata = { title: 'Gradovi · BALKAN EVENTS' };

export default async function CitiesPage() {
  let cities: any[] = [];
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api'}/locations/cities?limit=50`, { next: { revalidate: 60 } });
    if (res.ok) cities = await res.json();
  } catch {}
  return (
    <div className="bg-[#f6f5fb] min-h-screen pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-5">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-[#0d0b1f]">Gradovi</h1>
        <p className="text-gray-500 mt-1">Pronađi događaje u svom gradu.</p>
        {cities.length === 0 ? (
          <div className="mt-10"><EmptyState title="Nema gradova" description="Katalog se učitava ili API nije dostupan." /></div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cities.map(c => (
              <a key={c.id} href={`/search?city=${encodeURIComponent(c.name)}`} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6d3df5]/30 transition text-[#0d0b1f]">
                {c.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
