import Link from 'next/link';

export default function Organizer() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <section className="relative py-24 text-white">
        <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0b1020]/85" />
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-semibold">Organizatorska platforma</h1>
          <p className="mt-4 text-lg text-white/80">Kreiraj događaje, upravljaj ulaznicama i dosegni publiku širom Balkana.</p>
          <Link href="/register" className="inline-block mt-8 bg-gradient-to-r from-[#7047EB] to-[#9B6CFF] px-8 py-4 rounded-xl font-medium">Započni</Link>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-6">
        {[
          { t: 'Kreiraj događaje', d: 'Brzo postavi naziv, datum, lokaciju i fotografiju.' },
          { t: 'Upravljaj ulaznicama', d: 'Definiši tipove ulaznica i prati prodaju.' },
          { t: 'Statistika', d: 'Pregledaj stvarne podatke o svojim događajima.' },
        ].map(x => (
          <div key={x.t} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
            <h3 className="font-semibold text-lg">{x.t}</h3>
            <p className="mt-2 text-gray-600 text-sm">{x.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
