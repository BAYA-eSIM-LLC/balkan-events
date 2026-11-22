export const dynamic = 'force-dynamic';
import { EmptyState } from '@/components/ui';

export const metadata = { title: 'Kategorije · BALKAN EVENTS' };

export default async function CategoriesPage() {
  let cats: any[] = [];
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api'}/categories`, { next: { revalidate: 60 } });
    if (res.ok) cats = await res.json();
  } catch {}
  return (
    <div className="bg-[#f6f5fb] min-h-screen pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-5">
        <h1 className="text-3xl md:text-4xl font-display font-extrabold text-[#0d0b1f]">Kategorije</h1>
        <p className="text-gray-500 mt-1">Istraži događaje po tipu.</p>
        {cats.length === 0 ? (
          <div className="mt-10"><EmptyState title="Nema kategorija" description="Katalog se učitava ili API nije dostupan." /></div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map(c => (
              <a key={c.id} href={`/search?category_id=${c.id}`} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#6d3df5]/30 transition">
                <h3 className="font-semibold text-[#0d0b1f]">{c.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{c.slug}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
