'use client';
export default function ScannerPage() {
  return (
    <div className="max-w-lg mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-display font-bold mb-4">Mobilni scanner</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800">
        Scanner API (validacija QR ulaznica) nije prisutan na grani main. CORE 2 rad je zaustavljen i nije spojen. Nije moguće povezati scanner dok se backend endpointi ne dodaju.
      </div>
    </div>
  );
}
