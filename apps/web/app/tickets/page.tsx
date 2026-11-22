'use client';
export default function TicketsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-display font-bold mb-2">Moje ulaznice</h1>
      <p className="text-gray-500 mb-8">Digitalne QR ulaznice će se prikazati ovdje kada postoje stvarne narudžbe.</p>
      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400">
        Trenutno nema kupljenih ulaznica.
      </div>
    </div>
  );
}
