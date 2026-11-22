export const dynamic = 'force-dynamic';
import { fetchEvents } from '@/lib/api';

export const metadata = { title: 'Kategorije' };

export default async function CategoriesPage() {
  let cats: any[] = [];
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || '/api'}/categories`, { next: { revalidate: 60 } });
    if (res.ok) cats = await res.json();
  } catch {}
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold mb-2">Kategorije</h1>
      <p className="text-gray-500 mb-8">Podaci iz postojećeg kataloga.</p>
      {cats.length === 0 ? <p className="text-gray-400">Nema kategorija ili API nije dostupan.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cats.map(c => (
            <a key={c.id} href={`/search?category_id=${c.id}`} className="border rounded-2xl p-5 hover:border-violet-300">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-sm text-gray-500">{c.slug}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
