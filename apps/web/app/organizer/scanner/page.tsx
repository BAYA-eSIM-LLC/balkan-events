'use client';
export default function OrganizerScanner() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">QR Scanner</h1>
      <p className="text-zinc-400 text-sm mb-4">Kontrola ulaza – samo Scanner uloga</p>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm">
        <p className="text-amber-300 font-medium">CORE 2 Scanner</p>
        <p className="text-zinc-400 mt-2">Scanner endpointi postoje na grani core-2-scanner, nisu na main.</p>
        <p className="text-zinc-400 mt-1">Integracija: POST /scanner/validate (QR token, event_id, entry_point).</p>
        <p className="text-zinc-500 mt-3 text-xs">Scanner ne može upravljati organizacijom. Validacija je atomska (PostgreSQL lock).</p>
      </div>
    </div>
  );
}
