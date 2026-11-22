'use client';
export default function Scanner() {
  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex flex-col items-center justify-center px-5 text-center">
      <h1 className="text-3xl font-display font-semibold">Scanner</h1>
      <p className="mt-4 text-white/70 max-w-sm">Provjera QR ulaznica. Funkcija zahtijeva deployani scanner API koji trenutno nije dostupan na produkciji.</p>
      <div className="mt-8 w-64 h-64 border-2 border-dashed border-white/30 rounded-2xl flex items-center justify-center text-white/50">
        Kamera / QR
      </div>
      <p className="mt-6 text-sm text-amber-300">Backend endpoint nije aktivan</p>
    </div>
  );
}
