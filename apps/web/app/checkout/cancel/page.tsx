'use client';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">Plaćanje otkazano</h1>
      <p className="text-gray-500 mb-6">Niste završili plaćanje. Narudžba je i dalje rezervirana dok ne istekne.</p>
      <Link href="/" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-xl">Nazad na događaje</Link>
    </div>
  );
}
