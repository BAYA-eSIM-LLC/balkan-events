'use client';
export default function AdminFinance() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Finance</h1>
      <p className="text-zinc-400 text-sm mb-6">Upravljanje finance</p>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-amber-300 text-sm font-medium mb-2">Status modula</p>
        <p className="text-zinc-300 text-sm">
          UI je spreman. Backend endpointi postoje u kodu (admin_system / admin_catalog / events_engine).
          Aktivacija zahtijeva deploy punog API-ja. Nema lažnih podataka.
        </p>
        <div className="mt-4 text-xs text-zinc-500 space-y-1">
          <p>• Zaštićeno SUPERADMIN / ADMIN ulogom</p>
          <p>• Audit log za promjene</p>
          <p>• Povezivanje s webom i budućim mobilnim appovima</p>
        </div>
      </div>
    </div>
  );
}
