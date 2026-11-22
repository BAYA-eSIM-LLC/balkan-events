import Link from 'next/link';

export default function Organizer() {
  return (
    <div className="min-h-screen bg-[#f6f5fb]">
      <section className="relative py-20 md:py-28 text-white">
        <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b1f]/90 to-[#6d3df5]/60" />
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-extrabold">Organizatorska platforma</h1>
          <p className="mt-4 text-lg text-white/75">Kreiraj događaje, upravljaj ulaznicama i dosegni publiku širom Balkana.</p>
          <Link href="/register" className="inline-block mt-8 bg-white text-[#0d0b1f] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition">Započni</Link>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-5 py-14 grid md:grid-cols-3 gap-5">
        {[
          { t: 'Kreiraj događaje', d: 'Brzo postavi naziv, datum, lokaciju i fotografiju.' },
          { t: 'Upravljaj ulaznicama', d: 'Definiši tipove ulaznica i prati prodaju.' },
          { t: 'Statistika', d: 'Pregledaj stvarne podatke o svojim događajima.' },
        ].map(x => (
          <div key={x.t} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <h3 className="font-semibold text-lg text-[#0d0b1f]">{x.t}</h3>
            <p className="mt-2 text-gray-500 text-sm">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
